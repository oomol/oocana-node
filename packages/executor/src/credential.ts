import { isCredentialSchema } from "@oomol/oocana-sdk";
import { HandlesDef } from "@oomol/oocana-types";

export class CredentialInput {
  constructor(public type: string, public name: string, public id: string) {}
}

export function generateCredentialInput(credentialPath: string): CredentialInput | null {
  if (!credentialPath.startsWith("${{OO_CREDENTIAL:") || !credentialPath.endsWith("}}")) {
    return null;
  }

  const content = credentialPath.slice(17, -2); // Remove "${{OO_CREDENTIAL:" and "}}"
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