import { Mainframe } from "@oomol/oocana-sdk";
import type {
  ServiceExecutePayload,
  ServiceContext,
  ReporterMessage,
  ServiceEvent,
  ServiceStopOption,
} from "@oomol/oocana-types";
import { createContext } from "../context";
import {
  serviceConfigTopic,
  exitReportTopic,
  runActionTopic,
  prepareReportTopic,
  ServiceMessageTopic,
  pingActionTopic,
  pongReportTopic,
  shutdownActionTopic,
  statusReportTopic,
  ReportStatusPayload,
} from "./topic";

import {
  findFunction,
  getEntryPath,
  getModule,
  getServiceArgs,
  outputWithReturnObject,
  ExecutorName,
} from "../utils";
import { exit } from "process";
import { EventReceiver, Remitter } from "remitter";
import { logger, setupSessionLog } from "../logger";

function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}

const varStore: { [index: string]: any } = {};

class ServiceRuntime implements ServiceContext {
  public blockHandler: Map<string, any> | any;

  #runningBlocks = new Set<string>();
  #jobs = new Set<string>();
  #stopAt: ServiceStopOption = "session_end";

  events: EventReceiver<ServiceEvent>;

  #keepAliveSeconds: number = 10;
  #exitAfterBlockTimer: NodeJS.Timeout | null = null;
  #logger: typeof logger = logger;
  #sessionDir: string;
  #serviceHash: string;
  #sessionId?: string;
  #mainframe: Mainframe;
  #config: ServiceExecutePayload;
  #pkgDir: string;

  constructor({
    config,
    mainframe,
    serviceHash,
    sessionId,
    sessionDir,
  }: {
    config: ServiceExecutePayload;
    mainframe: Mainframe;
    serviceHash: string;
    sessionId?: string;
    sessionDir: string;
  }) {
    this.#sessionDir = sessionDir;
    this.#serviceHash = serviceHash;
    this.#config = config;
    this.#mainframe = mainframe;
    this.#sessionId = sessionId;

    const topicParams = {
      sessionId: sessionId,
      serviceHash: this.#serviceHash,
    };

    mainframe.subscribe(
      runActionTopic(topicParams),
      (payload: ServiceExecutePayload) => {
        this.runBlock(payload);
      }
    );

    mainframe.subscribe(pingActionTopic(topicParams), payload => {
      mainframe.publish(pongReportTopic(topicParams), payload);
    });

    mainframe.subscribe(shutdownActionTopic(topicParams), () => {
      this.dispose();
    });

    this.#pkgDir = process.env["OOCANA_PKG_DIR"] || "";

    // report message for every 5 seconds
    // TODO: 可以考虑性能以及开销

    setInterval(() => {
      mainframe.publish(statusReportTopic(), {
        service_hash: this.#serviceHash,
        session_id: this.#sessionId,
        executor: "nodejs",
        runningBlocks: Array.from(this.#runningBlocks),
      } as ReportStatusPayload);
    }, 5000);

    this.#stopAt = config.service_executor.stop_at || this.#stopAt;
    this.#logger = logger;

    this.start(config);
    this.setupStopTime();

    const events = new Remitter<ServiceEvent>();

    events.remit("message", () => {
      mainframe.subscribe(
        ServiceMessageTopic,
        (payload: ServiceEvent["message"]) => {
          if (this.#jobs.has(payload.job_id)) {
            this.#logger.info(`receive message`);
            events.emit("message", payload);
          }
        }
      );
      return () => {
        mainframe.unsubscribe(ServiceMessageTopic);
      };
    });
    this.events = events;
  }

  runBlock = async (payload: ServiceExecutePayload) => {
    this.#logger.info(`run block ${payload.block_name}`);
    const { session_id, job_id, outputs, block_name } = payload;
    this.cancelBlockExitTimer();
    this.#runningBlocks.add(job_id);
    this.#jobs.add(job_id);
    const jobInfo = { session_id, job_id };

    this.#logger.info(`run block ${block_name}`);

    const context = await createContext({
      mainframe: this.#mainframe,
      jobInfo,
      outputsDef: outputs,
      store: varStore,
      storeKey: ExecutorName,
      sessionDir: this.#sessionDir,
      tmpDir: this.#sessionDir, // TODO: use tmpDir and need consider global service
      packageName: this.#serviceHash,
      pkgDir: this.#pkgDir,
      flowStore: new Map(), // TODO: implement flowNodeStore
    });

    const originalDone = context.done;
    context.done = async () => {
      this.#runningBlocks.delete(job_id);
      await originalDone();
      if (this.#runningBlocks.size === 0) {
        this.startExitTimerIfNeeded();
      }
    };

    let result;
    if (typeof this.blockHandler === "function") {
      result = await this.blockHandler(block_name, context.inputs, context);
    } else if (this.blockHandler[block_name]) {
      const block = this.blockHandler[block_name];
      if (!block) {
        this.#logger.error(`block ${block_name} not found`);
        throw new Error(`block ${block_name} not found`);
      }
      if (typeof block !== "function") {
        this.#logger.error(`block ${block_name} is not a function`);
        throw new Error(`block ${block_name} is not a function`);
      }
      result = await block(context.inputs, context);
    }

    await outputWithReturnObject(context, result);
    this.#logger.info(`run block ${block_name} success`);
  };

  async start(config: ServiceExecutePayload) {
    this.#logger.info(`service is starting`);
    const filePath = await getEntryPath(
      config.service_executor.entry,
      config.dir
    );
    const module = await getModule(filePath);
    const func = findFunction(module, config.service_executor.function);

    await func(this);
    this.#logger.info(`service is started`);
    this.runBlock(config);
  }

  async dispose() {
    this.#logger.info(`service is disposing`);
    this.#mainframe.publish(exitReportTopic(), {
      service_hash: this.#serviceHash,
      session_id: this.#sessionId,
      executor: "nodejs",
    } as ReportStatusPayload);
    await this.#mainframe.disconnect();
  }

  setupStopTime = () => {
    switch (this.#stopAt) {
      case "block_end":
        // 在 runBlock 中设置
        break;
      case "app_end":
        this.exitBeforeApp();
        break;
      case "session_end":
        this.subscribeSessionEnd();
        break;
      case "never":
        break;
      default:
        assertNever(this.#stopAt);
    }
  };

  subscribeSessionEnd = () => {
    this.#mainframe.subscribe("/report", async (payload: ReporterMessage) => {
      if (
        payload.type === "SessionFinished" &&
        payload.session_id === this.#config.session_id
      ) {
        await this.dispose();
        exit(0);
      }
    });
  };

  cancelBlockExitTimer = () => {
    if (this.#exitAfterBlockTimer) {
      clearTimeout(this.#exitAfterBlockTimer);
    }
  };

  startExitTimerIfNeeded = () => {
    if (this.#stopAt !== "block_end") {
      return;
    }

    if (this.#exitAfterBlockTimer) {
      clearTimeout(this.#exitAfterBlockTimer);
    }
    this.#exitAfterBlockTimer = setTimeout(() => {
      this.#logger.info(`exit after block`);
      this.#exitAfterBlockTimer = null;
      this.dispose();
      exit(0);
    }, this.#keepAliveSeconds * 1000);
  };

  exitBeforeApp = () => {
    // TODO: app 级别的退出暂时没写，先使用 session 生命周期。后续可以在 Executor 中退出，或者增加 mqtt topic
  };
}

async function startService() {
  const { address, serviceHash, sessionDir, sessionId } = getServiceArgs();
  setupSessionLog({
    serviceHash,
    sessionId,
  });

  console.log("start service");
  const mainframe = new Mainframe(`mqtt://${address}`, serviceHash);
  await mainframe.connectingPromise;

  mainframe.subscribe(
    serviceConfigTopic({
      sessionId: sessionId,
      serviceHash: serviceHash,
    }),
    (payload: ServiceExecutePayload) => {
      new ServiceRuntime({
        config: payload,
        sessionId,
        mainframe,
        serviceHash,
        sessionDir,
      });
    }
  );

  mainframe.publish(
    prepareReportTopic({
      sessionId: sessionId,
      serviceHash: serviceHash,
    }),
    {}
  );
}

startService();
