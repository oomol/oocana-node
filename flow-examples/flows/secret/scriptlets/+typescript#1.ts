import type { Context } from "@oomol/oocana-types";

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
  console.log("log output:" + inputs);

  context.reportLog("reportLog:" + JSON.stringify(inputs), "stdout");

  return { out: inputs };
}
