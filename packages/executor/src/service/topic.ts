const statusTopic = "/service/report/status";
const exitTopic = "/service/report/exit";

// 在 mqtt 中传递的字段，都使用 snake_case 风格命名
export type ReportStatusPayload = {
  service_hash: string;
  session_id?: string;
  executor: "nodejs";
};

// prefix
const globalServiceTopicPrefix = "/service/nodejs";
const serviceTopicPrefix = "/{session_id}/service/nodejs";

// action suffix
const serviceConfigSuffix = "action/config";
const serviceRunSuffix = "action/run";
const servicePingSuffix = "action/ping";
const serviceShutdownSuffix = "action/shutdown";

// report suffix
const servicePrepareSuffix = "report/prepare";
const servicePongSuffix = "report/pong";

// topic = {prefix}/{service_hash}/{suffix}

function prefix(sessionId?: string) {
  if (sessionId) {
    return serviceTopicPrefix.replace("{session_id}", sessionId);
  } else {
    return globalServiceTopicPrefix;
  }
}

export type ServiceTopicParams = {
  sessionId?: string;
  serviceHash: string;
};

export function runActionTopic(params: ServiceTopicParams): string {
  return [prefix(params.sessionId), params.serviceHash, serviceRunSuffix].join(
    "/"
  );
}

export function pingActionTopic(params: ServiceTopicParams): string {
  return [prefix(params.sessionId), params.serviceHash, servicePingSuffix].join(
    "/"
  );
}

export function shutdownActionTopic(params: ServiceTopicParams) {
  return [
    prefix(params.sessionId),
    params.serviceHash,
    serviceShutdownSuffix,
  ].join("/");
}

// TODO: 修改 oomol 端实现，使其为固定的 topic，不需要 sessionId
export const ServiceMessageTopic = "/service/message";

export function prepareReportTopic(params: ServiceTopicParams) {
  return [
    prefix(params.sessionId),
    params.serviceHash,
    servicePrepareSuffix,
  ].join("/");
}

export function pongReportTopic(params: ServiceTopicParams) {
  return [prefix(params.sessionId), params.serviceHash, servicePongSuffix].join(
    "/"
  );
}

export function exitReportTopic() {
  return exitTopic;
}

export function serviceConfigTopic(params: ServiceTopicParams) {
  return [
    prefix(params.sessionId),
    params.serviceHash,
    serviceConfigSuffix,
  ].join("/");
}

export function statusReportTopic() {
  return statusTopic;
}
