import { ContextImpl, Mainframe } from "@oomol/oocana-sdk";
import { MainFunction, Context, ExecutorPayload } from "@oomol/oocana-types";
import { createContext } from "./context";
import { valStore } from "./executor";
import {
  findFunction,
  getEntryPath,
  getModule,
  outputWithReturnObject,
  ExecutorName,
} from "./utils";
import { asyncLocalStorage } from "./hook";
import "./hook";
import { createModuleFile } from "./file";
import { logger } from "./logger";

async function runFunction(
  func: MainFunction<any, any>,
  context: Context<any, any>
) {
  return await asyncLocalStorage.run(context, func, context.inputs, context);
}

export async function runBlock(
  mainframe: Mainframe,
  payload: ExecutorPayload,
  sessionDir: string,
  tmpDir: string,
  packageName: string,
  pkgDir: string,
  flowStore: Map<string, { [node: string]: any }>
): Promise<void> {
  const { session_id, job_id, executor, dir, outputs } = payload;
  const jobInfo = { session_id, job_id };

  logger.info(`run block job_id: ${job_id}`);

  let context: ContextImpl;
  try {
    context = await createContext({
      mainframe,
      jobInfo,
      outputsDef: outputs,
      store: valStore,
      storeKey: ExecutorName,
      sessionDir,
      tmpDir,
      packageName,
      pkgDir,
      flowStore,
    });
  } catch (err) {
    logger.error(`create context error`, err);
    await mainframe.sendError({
      type: "BlockError",
      ...jobInfo,
      error: (err as Error).toString(),
    });
    return;
  }

  let filePath;
  let func;

  try {
    if (executor.options?.source) {
      const entry = await createModuleFile({
        dir,
        filename: context.node_id,
        source: executor.options.source,
      });
      filePath = await getEntryPath(entry);
      const module = await getModule(filePath);
      func = findFunction(module, executor.options?.function);
    } else {
      filePath = await getEntryPath(executor.options?.entry ?? "main.ts", dir);
      const module = await getModule(filePath);
      // console.log("module", module);
      logger.debug(`name: ${executor.options?.function}`);
      func = findFunction(module, executor.options?.function);
    }
  } catch (error) {
    logger.error(`get function error`, error);
    context.done(error);
    return;
  }

  try {
    const result = await runFunction(func, context);
    await outputWithReturnObject(context, result);
    logger.info(`run block success job_id: ${job_id}`);
  } catch (error) {
    logger.error(`run block job_id: ${job_id} error`, error);
    context.done(error);
  }
}
