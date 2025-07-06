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
  const events = await context.runBlock("counter", { input: "test" });
  const p = new Promise(resolve => {
    events.on("BlockFinished", payload => {
      resolve(payload);
    });
  });
  return { a: "a", b: "b" };
}
