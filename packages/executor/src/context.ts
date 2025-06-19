import { ContextImpl, Mainframe, outputRefKey } from "@oomol/oocana-sdk";
import {
  BinaryValue,
  HandlesDef,
  JobInfo,
  VarValue,
} from "@oomol/oocana-types";
import { logger } from "./logger";
import { replaceSecret } from "./secret";
import { readFile } from "fs/promises";

function isBinaryValue(value: any): value is BinaryValue {
  return value && (value as BinaryValue)["__OOMOL_TYPE__"] == "oomol/bin";
}

function isVarValue(value: any): value is VarValue {
  return value && (value as VarValue)["__OOMOL_TYPE__"] == "oomol/var";
}

export async function createContext({
  mainframe,
  jobInfo,
  outputsDef,
  store,
  storeKey,
  sessionDir,
  tmpDir,
  packageName,
  pkgDir,
  flowStore,
}: {
  mainframe: Mainframe;
  jobInfo: JobInfo;
  outputsDef: HandlesDef;
  store: { [index: string]: any };
  storeKey: string;
  sessionDir: string;
  tmpDir: string;
  packageName: string;
  pkgDir: string;
  flowStore: Map<string, { [node: string]: any }>;
}) {
  const { session_id, job_id } = jobInfo;

  const blockReadyResponse = await mainframe.sendReady({
    type: "BlockReady",
    session_id,
    job_id,
  });
  logger.info(`receive block ready response job_id: ${job_id}`);

  const {
    inputs,
    inputs_def: inputsDef,
    inputs_def_patch: inputsDefPatch,
  } = blockReadyResponse;

  const node_inputs = await replaceSecret(inputs, inputsDef, inputsDefPatch);

  for (const [key, value] of Object.entries(node_inputs)) {
    if (isVarValue(value)) {
      const storeKey = outputRefKey(value.value);
      // 支持传递的 undefined 的变量
      if (storeKey in store) {
        node_inputs[key] = store[storeKey];
      } else {
        logger.warn(`store key not found: ${value}. will use value.ref`);
      }
    } else if (isBinaryValue(value)) {
      const path = value.value;
      if (typeof path !== "string") {
        logger.warn(`Bin value not string: ${path}, path: ${inputsDef[key]}`);
      } else {
        try {
          const buf = await readFile(path);
          node_inputs[key] = buf;
        } catch (e) {
          logger.error(`write bin to file error: ${e}`);
        }
      }
    }
  }

  const block_path = blockReadyResponse.block_path;
  const stacks = Object.freeze(blockReadyResponse.stacks);

  let combine_node_id = "node";
  if (stacks.length > 0) {
    stacks.forEach(stack => {
      combine_node_id += `${stack.flow_job_id}_${stack.node_id}`;
    });
  }

  let flowNodeStore = flowStore.get(combine_node_id);
  if (!flowNodeStore) {
    flowNodeStore = new Map();
    flowStore.set(combine_node_id, flowNodeStore);
  }

  return new ContextImpl({
    blockInfo: {
      session_id,
      job_id,
      block_path,
      stacks,
    },
    mainframe,
    inputs: Object.freeze(node_inputs),
    inputsDef,
    outputsDef,
    store,
    storeKey,
    sessionDir,
    tmpDir,
    packageName,
    pkgDir,
    flowNodeStore,
  });
}
