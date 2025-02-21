import {
  containSubSecretSchema,
  isBinSchema,
  isPrimitiveSchema,
  isSecretSchema,
  isVarSchema,
} from "@oomol/oocana-sdk";
import { FieldSchema, HandlesDef, HandlesDefPatch } from "@oomol/oocana-types";
import { readFile } from "fs/promises";
import logger from "./logger";
import os from "os";

export const SECRET_PATH =
  os.homedir() + "/app-config/oomol-secrets/secrets.json";

type SecretName = string;
type SecretType = string;
type SecretKey = string;

type SecretConf = {
  [name: SecretName]: {
    secretType: SecretType;
    secretName: SecretName;
    secrets: {
      secretKey: SecretKey;
      value: string;
    }[];
  };
};

type SecretPath = [SecretType, SecretName, SecretKey];

// ${{OO_SECRET:type,name,key}}，捕获组为 (type,name,key)
const SECRET_REGEX = /"\$\{\{OO_SECRET:([^,]+,[^,]+,[^,]+)\}\}"/g;

export async function replaceSecret(
  inputs: any,
  root_def: HandlesDef,
  def_patch?: HandlesDefPatch
) {
  const secrets = await readSecretConf();

  let string_inputs = JSON.stringify(inputs);
  const secret_match = string_inputs.matchAll(SECRET_REGEX);

  if (secret_match && secrets) {
    for (const m of secret_match) {
      const secret_capture = m[1] || "";
      const real_secret = await getSecret(secret_capture, secrets);
      if (secret_capture != "" && secret_capture != real_secret) {
        string_inputs = string_inputs.replace(
          m[0],
          `"${real_secret.replaceAll('"', '\\"')}"`
        );
      }
    }
    try {
      inputs = JSON.parse(string_inputs);
    } catch (error) {
      throw new Error(`replaceSecret parse json parse error: ${error}`);
    }
  } else if (secret_match) {
    logger.warn(
      `Secret file not found or is not a json file. please check the file path: ${SECRET_PATH}`
    );
  }

  for (const [key, value] of Object.entries(inputs || {})) {
    const def = root_def[key];
    if (def == null || def.json_schema == null) {
      continue;
    } else if (isPrimitiveSchema(def.json_schema)) {
      continue;
    } else if (isVarSchema(def.json_schema) || isBinSchema(def.json_schema)) {
      // 在外部重复做，保持功能单一。
      // 如果后续 var 也支持嵌套，考虑到性能问题，最好移进来
    } else if (isSecretSchema(def.json_schema)) {
      if (typeof value == null) {
        logger.info(`Secret value is null: ${def}. just pass it.`);
      } else if (typeof value !== "string") {
        logger.warn(`Secret value not string: ${value}, path: ${def}`);
      } else if (!secrets) {
        logger.warn(
          `Secret file not found or is not a json file. please check the file path: ${SECRET_PATH}`
        );
        break;
      } else {
        inputs[key] = await getSecret(value as string, secrets);
      }
    } else {
      if (containSubSecretSchema(def.json_schema)) {
        if (!secrets) {
          logger.warn(
            `Secret file not found or is not a json file. please check the file path: ${SECRET_PATH}`
          );
          break;
        } else {
          await replaceSubSecret(value, def.json_schema, secrets);
        }
      }
    }
  }

  const node_inputs = inputs || {};

  // inputs_def_patch
  if (def_patch) {
    const patch = def_patch;
    for (const [k, v] of Object.entries(patch)) {
      let input_value = node_inputs[k] as any;
      if (input_value) {
        for (const patch of v) {
          const path = patch.path;
          const isSecret = patch?.schema?.contentMediaType === "oomol/secret";

          if (!isSecret) {
            continue;
          }

          if (!secrets) {
            logger.warn(
              `Secret file not found or is not a json file. please check the file path: ${SECRET_PATH}`
            );
            break;
          }

          if (path === "" || path == null) {
            // 说明是整个替换
            node_inputs[k] = await getSecret(input_value, secrets);
          } else if (typeof path === "string" && path in input_value) {
            input_value[path] = await getSecret(input_value[path], secrets);
          } else if (typeof path === "number" && path in input_value) {
            input_value[path] = await getSecret(input_value[path], secrets);
          } else if (Array.isArray(path)) {
            let temp = input_value;
            for (let i = 0; i < path.length; i++) {
              if (i === path.length - 1) {
                temp[path[i]] = await getSecret(temp[path[i]], secrets);
              } else {
                temp = temp[path[i]];
              }
            }
          }
        }
      }
    }
  }

  return node_inputs;
}

async function readSecretConf(
  file: string = SECRET_PATH
): Promise<SecretConf | undefined> {
  try {
    const f = await readFile(file, "utf-8");
    return JSON.parse(f);
  } catch (e) {
    logger.warn(`Secret file parse error: ${e}`);
    return undefined;
  }
}

async function replaceSubSecret(
  value: any,
  def: FieldSchema,
  secrets: SecretConf
) {
  if (def.type === "object" && typeof value === "object") {
    if (def.properties) {
      for (const [key, v] of Object.entries(value)) {
        const subDef = def.properties[key];
        if (subDef == null) {
          continue;
        } else if (isSecretSchema(subDef)) {
          if (typeof v !== "string") {
            logger.warn(`Secret value not string: ${v}, path: ${subDef}`);
          } else {
            value[key] = await getSecret(v, secrets);
          }
        } else {
          await replaceSubSecret(v, subDef, secrets);
        }
      }
    }
  } else if (def.type === "array" && Array.isArray(value)) {
    if (def.items) {
      if (isSecretSchema(def.items)) {
        for (let i = 0; i < value.length; i++) {
          if (typeof value[i] !== "string") {
            logger.warn(
              `Secret value not string: ${value[i]}, path: ${def.items}`
            );
          } else {
            value[i] = await getSecret(value[i], secrets);
          }
        }
      } else {
        for (let i = 0; i < value.length; i++) {
          await replaceSubSecret(value[i], def.items, secrets);
        }
      }
    }
  }
}

// studio 上尽量先检查路径存在，这边报错和告警信息，只是为了保险起见
async function getSecret(path: string, secrets: SecretConf): Promise<string> {
  const [type, name, key]: SecretPath = path.split(
    ","
  ) as unknown as SecretPath;

  const scope = secrets[name];
  if (!scope) {
    logger.warn(`Secret Name not found: ${name} for ${path}`);
    return path;
  }

  if (scope.secretType !== type) {
    logger.warn(
      `Secret Type mismatch: ${scope.secretType} !== ${type}, path: ${path}`
    );
  }

  const secret = scope.secrets.find(s => s.secretKey === key);

  if (!secret || !secret.value) {
    logger.warn(`Secret Key not found in ${name}: ${path}`);
  }

  return secret?.value || path;
}
