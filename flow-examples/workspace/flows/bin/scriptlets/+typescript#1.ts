import type { Context } from "@oomol/types/oocana";

type Inputs = {
  in: unknown;
}
type Outputs = {
  out: unknown;
}

export default async function(
  inputs: Inputs,
  context: Context<Inputs, Outputs>
): Promise<Outputs> {

  // your code
  let bin = Buffer.from("aaaa", "ascii");

  return { out: bin };
};
