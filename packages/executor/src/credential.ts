import { isCredentialSchema, CredentialInput } from "@oomol/oocana-sdk";
import { HandlesDef } from "@oomol/oocana-types";

export function generateCredentialInput(
  credentialPath: string
): CredentialInput | null {
  const PREFIX = "${{OO_CREDENTIAL:";
  const SUFFIX = "}}";
  if (!credentialPath.startsWith(PREFIX) || !credentialPath.endsWith(SUFFIX))
    return null;
  const content = credentialPath.slice(PREFIX.length, -SUFFIX.length).trim();

  if (!content) {
    return null;
  }

  const parts = content.split(",");
  if (parts.length !== 3) {
    return null;
  }

  const [type, name, id] = parts;
  if (!type || !name || !id) {
    return null;
  }

  return new CredentialInput(type, name, id);
}

export function replaceCredential(inputs: any, inputsDef: HandlesDef): any {
  if (typeof inputs !== "object" || inputs === null) {
    return inputs;
  }

  for (const [key, value] of Object.entries(inputs)) {
    const def = inputsDef[key];
    if (!def?.json_schema) {
      continue;
    }

    if (typeof value === "string" && isCredentialSchema(def.json_schema)) {
      const credInput = generateCredentialInput(value);
      if (credInput) {
        inputs[key] = credInput;
      }
    }
  }

  return inputs;
}
