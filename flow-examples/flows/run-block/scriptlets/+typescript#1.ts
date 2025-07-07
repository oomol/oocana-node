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
  context.outputs({ a: "a", b: "b" });
  console.log("Running block with inputs:", _inputs);
  const res = await context.runBlock("counter", { input: "test" });
  res.onOutput(data => {
    console.log("Output from counter block:", data);
  });
  const result = await res.result;
  console.log("Result from counter block:", result);
  return { a: "a", b: "b" };
}
