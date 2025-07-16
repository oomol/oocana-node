import type { Context } from "@oomol/oocana-types";

type Inputs = {
  in: unknown;
};
type Outputs = {
  a: string;
  b: string;
};

export default async function (
  _inputs: Inputs,
  context: Context<Inputs, Outputs>
): Promise<Outputs> {
  const downstream = await context.queryDownstream();
  console.log("downstream", downstream);

  return { a: "a", b: "b" };
}
