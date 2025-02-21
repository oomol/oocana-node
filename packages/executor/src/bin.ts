#!/usr/bin/env node
process.setSourceMapsEnabled(true);
import { runExecutor } from "./executor";
import { logger } from "./logger";
import { getExecutorArgs } from "./utils";

const args = getExecutorArgs();

runExecutor(args).catch(error => {
  logger.error("run executor exit:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", err => {
  logger.error("Uncaught Exception thrown", err);
});
