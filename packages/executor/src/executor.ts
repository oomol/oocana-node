import type {
  ServiceExecutePayload,
  ExecutorPayload,
  ReporterMessage,
  IMainframeExecutorReady,
} from "@oomol/oocana-types";
import { Mainframe } from "@oomol/oocana-sdk";
import { runBlock } from "./block";
import { spawn } from "child_process";
import {
  exitReportTopic,
  pingActionTopic,
  pongReportTopic,
  prepareReportTopic,
  ReportStatusPayload,
  runActionTopic,
  serviceConfigTopic,
  ServiceTopicParams,
  statusReportTopic,
} from "./service/topic";
import { setupSessionLog, logger } from "./logger";
import { EventEmitter } from "node:events";
import {
  isServicePayload,
  ExecutorName,
  ExecutorArgs,
  cleanupTmpFile,
  isDebug,
} from "./utils";
import path from "node:path";

export const valStore: { [index: string]: any } = {};

const jobSet = new Set<string>();
const nodeStoreMap = new Map<string, { [index: string]: any }>();

type ServiceStatus = "running" | "launching";

const emitter = new EventEmitter();
const serviceStore: Map<string, ServiceStatus> = new Map();

export async function runExecutor({
  address = "127.0.0.1:47688",
  sessionId,
  sessionDir,
  package: packagePath,
  identifier,
  tmpDir,
  inspectWait,
}: ExecutorArgs): Promise<() => void> {
  setupSessionLog({ sessionId, identifier });

  let packageName = packagePath ? path.basename(packagePath) : "workspace";
  const pkgDir = process.env["OOCANA_PKG_DIR"] || "";

  logger.info(
    `executor ${ExecutorName} start, session ${sessionId} for ${
      packagePath || "none package"
    }`
  );

  const mainframe = new Mainframe(
    `mqtt://${address}`,
    `nodejs-executor-` + (identifier || sessionId)
  );

  const isCurrentSession = (payload: any) => payload.session_id == sessionId;
  const isCurrentJob = (payload: any) => {
    return identifier == payload.identifier;
  };

  mainframe.subscribe(
    `executor/${ExecutorName}/run_block`,
    (payload: ExecutorPayload) => {
      if (!isCurrentSession(payload)) {
        return;
      }

      if (!isCurrentJob(payload)) {
        return;
      }

      // oocana-rust 会重复发送 job_id
      if (jobSet.has(payload.job_id)) {
        logger.warn(`job ${payload.job_id} is running, ignore`);
        return;
      }
      jobSet.add(payload.job_id);

      runBlock(
        mainframe,
        payload,
        sessionDir,
        tmpDir,
        packageName,
        pkgDir,
        nodeStoreMap
      );
    }
  );

  mainframe.subscribe(statusReportTopic(), (payload: ReportStatusPayload) => {
    serviceStore.set(payload.service_hash, "running");
  });

  mainframe.subscribe(exitReportTopic(), (payload: ReportStatusPayload) => {
    serviceStore.delete(payload.service_hash);
  });

  mainframe.subscribe(
    `executor/${ExecutorName}/run_service_block`,
    (payload: ServiceExecutePayload) => {
      if (!isCurrentSession(payload)) {
        return;
      }

      if (!isCurrentJob(payload)) {
        return;
      }

      if (isServicePayload(payload)) {
        let { service_hash: hash } = payload;
        const isGlobalService =
          payload.service_executor.stop_at == "app_end" ||
          payload.service_executor.stop_at == "never";

        const serviceTopicParams = isGlobalService
          ? { serviceHash: hash }
          : { sessionId: sessionId, serviceHash: hash };

        const spawnAction = () =>
          spawnService(payload, mainframe, {
            address,
            sessionId,
            sessionDir,
            serviceName: payload.service_executor.name,
            serviceParams: serviceTopicParams,
            serviceHash: hash,
          });

        if (serviceStore.has(hash)) {
          logger.info(`service ${hash} is running, just send message`);
          sendToService(mainframe, payload, serviceTopicParams);
        } else if (isGlobalService) {
          // TODO: 最好有其他更健壮的方式来确认 global service 的运行状态。
          const t = setTimeout(() => {
            logger.info(
              `wait service ${hash} 1s timeout, try spawn service for ${hash}`
            );
            mainframe.unsubscribe(pongReportTopic(serviceTopicParams));
            spawnAction();
            emitter.once(`service/running/${hash}`, () => {
              sendToService(mainframe, payload, serviceTopicParams);
            });
          }, 1000);

          mainframe.subscribe(pongReportTopic(serviceTopicParams), () => {
            logger.info(`receive service ${hash} reply, just send message`);
            clearTimeout(t);
            sendToService(mainframe, payload, serviceTopicParams);
            mainframe.unsubscribe(pongReportTopic(serviceTopicParams));
          });

          mainframe.publish(pingActionTopic(serviceTopicParams), {});
        } else {
          logger.info(`spawn service for ${hash}`);
          spawnAction();
          emitter.once(`service/running/${hash}`, () => {
            sendToService(mainframe, payload, serviceTopicParams);
          });
        }
      }
    }
  );

  mainframe.subscribe(`report`, async (payload: ReporterMessage) => {
    switch (payload.type) {
      case "SessionFinished":
        if (isCurrentSession(payload)) {
          logger.info(`session ${sessionId} finished, executor exit`);
          await cleanupTmpFile();
          process.exit(0);
        }
        break;
      default:
        break;
    }
  });

  await mainframe.connectingPromise;
  logger.info(`connecting to broker ${address} success`);

  const debugInfo: Partial<IMainframeExecutorReady> = {};
  if (isDebug()) {
    debugInfo["inspect_wait"] = inspectWait;
    debugInfo["process_id"] = process.pid;
  }

  mainframe.sendExecutorReady({
    type: "ExecutorReady",
    executor_name: ExecutorName,
    session_id: sessionId,
    package: packagePath,
    identifier,
    ...debugInfo,
  });

  return () => {
    mainframe.disconnect();
  };
}

function spawnService(
  payload: ServiceExecutePayload,
  mainframe: Mainframe,
  options: {
    address: string;
    sessionDir: string;
    serviceName: string;
    sessionId: string;
    serviceParams: ServiceTopicParams;
    serviceHash: string;
  }
) {
  serviceStore.set(options.serviceHash, "launching");
  const {
    address,
    sessionDir,
    serviceName,
    sessionId,
    serviceParams,
    serviceHash,
  } = options;

  let args = `--address ${address} --session-dir ${sessionDir}`;
  if (serviceParams.sessionId) {
    args += ` --session-id ${sessionId}`;
  }
  if (serviceParams.serviceHash) {
    args += ` --service-hash ${serviceParams.serviceHash}`;
  }
  logger.info(`spawn service with args: ${args} in ${__dirname}`);

  // 要根据 nodejs-executor 的目录进行查找。executor 默认的工作目录在 package 根目录。
  const child = spawn(`node ./service/service.js ${args}`, {
    shell: true,
    cwd: __dirname,
  });

  mainframe.subscribe(prepareReportTopic(serviceParams), () => {
    serviceStore.set(serviceHash, "running");
    mainframe.publish(serviceConfigTopic(serviceParams), payload);
    mainframe.unsubscribe(prepareReportTopic(serviceParams));
    logger.info(`service ${serviceName} ${sessionId} is prepared`);
    emitter.emit(`service/running/${serviceHash}`);
  });

  child.stderr.on("data", data => {
    logger.error(
      `service ${serviceName} ${sessionId}  stderr: ${String(data)}`
    );
  });

  child.on("close", code => {
    serviceStore.delete(serviceHash);
    logger.info(`service ${serviceName} ${sessionId} exited with code ${code}`);
  });

  child.on("error", err => {
    logger.error(`service ${serviceName} ${sessionId} error: ${err}`);
  });
}

function sendToService(
  mainframe: Mainframe,
  payload: ServiceExecutePayload,
  params: ServiceTopicParams
) {
  const status = serviceStore.get(params.serviceHash);
  switch (status) {
    case "launching":
      logger.info(`service ${params.serviceHash} is launching, just waiting`);
      // TODO: 考虑超时时间
      emitter.once(`service/running/${params.serviceHash}`, () => {
        logger.info(`service ${params.serviceHash} is running, send message`);
        mainframe.publish(runActionTopic(params), payload);
      });
      break;
    case "running":
      mainframe.publish(runActionTopic(params), payload);
      break;
    default:
      logger.error(`service ${params.serviceHash} not found`);
  }
}
