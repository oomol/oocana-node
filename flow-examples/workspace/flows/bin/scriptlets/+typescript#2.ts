import type { Context } from "@oomol/types/oocana";

type Inputs = {
  a: Buffer;
}
type Outputs = {
  out: unknown;
}

export default async function(
  inputs: Inputs,
  context: Context<Inputs, Outputs>
): Promise<Outputs> {

  // your code
  let a = inputs.a;
  let str = a.toString("base64");
  console.log(`str: ${str}`);

  return { out: null };
};
