import winston from "winston";
import { homedir } from "os";
import { join } from "path";

const _logger = winston.createLogger({
  level: "debug",
  format: winston.format.json(),
  // rust 端会捕获所有 stdout/stderr 输出，如果是被 spawn 出来的，不把日志输出到 console 里面，避免重复
  transports: process.env["IS_FORKED"]
    ? []
    : [new winston.transports.Console({ format: winston.format.simple() })],
});

_logger.warning = _logger.warn;

let added = false;

type ServiceLogParams = {
  serviceHash: string;
  sessionId?: string;
};

type ExecutorLogParams = {
  sessionId: string;
  identifier?: string;
};

export const setupSessionLog = (
  params: ServiceLogParams | ExecutorLogParams
) => {
  // 一个进程只配置一次
  if (added) {
    return;
  }

  let filename: string;
  // executor 的进程日志
  // ~/.oocana/sessions/${sessionId}/nodejs-{identifier}.log
  // ~/.oocana/sessions/${sessionId}/nodejs.log
  // service in session 的进程日志
  //  ~/.oocana/sessions/nodejs-${serviceHash}.log
  if ("sessionId" in params) {
    const dir = join(homedir(), ".oocana", "sessions", `${params.sessionId}`);
    // undefined 也可以满足 in
    if ("identifier" in params && params.identifier) {
      filename = join(dir, `nodejs-${params.identifier}.log`);
    } else if ("serviceHash" in params && params.serviceHash) {
      filename = join(dir, `nodejs-${params.serviceHash}.log`);
    } else {
      filename = join(dir, `nodejs.log`);
    }
  } else {
    // / global service 的进程日志
    // ~/.oocana/services/nodejs-${serviceHash}.log
    filename = join(
      homedir(),
      ".oocana",
      "services",
      `nodejs-${params.serviceHash}.log`
    );
  }

  _logger.add(
    new winston.transports.File({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      filename,
    })
  );
  added = true;
};

export default _logger;
export const logger = _logger;
