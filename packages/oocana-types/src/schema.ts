// 跟随 block yaml 的 schema。
// 如果能够跟随 @oomol/schema 的类型更好。
export type HandleDef = {
  handle: string;
  json_schema?: RootFieldSchema;
  kind?: string;
  description?: string;
  value?: any;
  nullable?: boolean;
};
export type HandlesDef = {
  [name: string]: HandleDef;
};

// var 目前只能放在根目录
export type RootFieldSchema = FieldSchema | VarFieldSchema | BinFieldSchema;

export type FieldSchema =
  | ArrayFieldSchema
  | ObjectFieldSchema
  | PrimitiveFieldSchema
  | SecretFieldSchema;

type ArrayFieldSchema = {
  type: "array";
  contentMediaType?: OomolType;
  items?: FieldSchema;
};

type ObjectFieldSchema = {
  type: "object";
  contentMediaType?: OomolType;
  properties?: {
    [name: string]: FieldSchema;
  };
};

export type PrimitiveFieldSchema = {
  type: "string" | "number" | "boolean";
};

export type VarFieldSchema = {
  contentMediaType: "oomol/var";
};

export type BinFieldSchema = {
  contentMediaType: "oomol/bin";
};

export type SecretFieldSchema = {
  type: "string";
  contentMediaType: "oomol/secret";
};

export type HandlesDefPatch = {
  [name: string]: DefPatch[];
};

export type DefPatch = {
  path?: string | number | [string];
  schema?: {
    contentMediaType?: OomolType;
  };
};

export type BinaryValue = {
  __OOMOL_TYPE__: "oomol/bin";
  value: string;
};

export type StoreKeyRef = {
  executor: string;
  session_id: string;
  job_id: string;
  handle: string;
};

export type VarValue = {
  __OOMOL_TYPE__: "oomol/var";
  value: StoreKeyRef;
};

type OomolType = "oomol/var" | "oomol/secret" | "oomol/bin";
