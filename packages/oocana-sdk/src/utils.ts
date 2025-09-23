import {
  BinFieldSchema,
  CredentialFieldSchema,
  HandlesDef,
  PrimitiveFieldSchema,
  RootFieldSchema,
  SecretFieldSchema,
  StoreKeyRef,
  VarFieldSchema,
} from "@oomol/oocana-types";

export function isValHandle(def: HandlesDef, handle: string): boolean {
  const handleDef = def[handle];
  return !!(handleDef?.json_schema && isVarSchema(handleDef.json_schema));
}

export function isBinHandle(def: HandlesDef, handle: string): boolean {
  const handleDef = def[handle];
  return !!(handleDef?.json_schema && isBinSchema(handleDef.json_schema));
}

export function isCredentialHandle(def: HandlesDef, handle: string): boolean {
  const handleDef = def[handle];
  return !!(handleDef?.json_schema && isCredentialSchema(handleDef.json_schema));
}

export function isSecretSchema(def: RootFieldSchema): def is SecretFieldSchema {
  if (isVarSchema(def)) {
    return false;
  }

  if (isBinSchema(def)) {
    return false;
  }

  if (def.type !== "string") {
    return false;
  }

  return (def as SecretFieldSchema).contentMediaType === "oomol/secret";
}

export function isPrimitiveSchema(
  def: RootFieldSchema
): def is PrimitiveFieldSchema {
  if (isVarSchema(def)) {
    return false;
  }

  if (isSecretSchema(def)) {
    return false;
  }

  if (isBinSchema(def)) {
    return false;
  }

  if (isCredentialSchema(def)) {
    return false;
  }

  return (
    def.type === "string" || def.type === "number" || def.type === "boolean"
  );
}

export function isBinSchema(def: RootFieldSchema): def is BinFieldSchema {
  return (def as BinFieldSchema).contentMediaType === "oomol/bin";
}

export function isVarSchema(def: RootFieldSchema): def is VarFieldSchema {
  return (def as VarFieldSchema).contentMediaType === "oomol/var";
}

export function isCredentialSchema(def: RootFieldSchema): def is CredentialFieldSchema {
  if (isVarSchema(def)) {
    return false;
  }

  if (isBinSchema(def)) {
    return false;
  }

  if (def.type !== "string") {
    return false;
  }

  return (def as CredentialFieldSchema).contentMediaType === "oomol/credential";
}

export function outputRefKey(ref: StoreKeyRef): string {
  return ref.session_id + "/" + ref.job_id + "/" + ref.handle;
}

export function containSubSecretSchema(
  def: RootFieldSchema,
  nested: boolean = false
): boolean {
  if (isVarSchema(def)) {
    return false;
  }

  if (isBinSchema(def)) {
    return false;
  }

  if (isSecretSchema(def)) {
    return nested;
  }

  if (isPrimitiveSchema(def)) {
    return false;
  }

  if (def.type === "object") {
    for (const key in def.properties) {
      if (containSubSecretSchema(def.properties[key], true)) {
        return true;
      }
    }
  }

  if (def.type === "array" && def.items) {
    if (containSubSecretSchema(def.items, true)) {
      return true;
    }
  }

  return false;
}
