import type { Context } from "@oomol/types/oocana";

type Inputs = {
  in: unknown;
};
type Outputs = {
  out: unknown;
};

export default async function (
  inputs: Inputs,
  context: Context<Inputs, Outputs>
): Promise<Outputs> {
  console.log("env: ", process.env);
  if (process.env["OOMOL_VAR"] != "1") {
    throw new Error("OOMOL_VAR set");
  }

  if (process.env["VAR"] != "1") {
    throw new Error("VAR not set");
  }

  if (process.env["KKK"] != "VVV") {
    throw new Error("KKK not set");
  }

  return { out: new Date() };
}
