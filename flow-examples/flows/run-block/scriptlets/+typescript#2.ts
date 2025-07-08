import type { Context } from "@oomol/oocana-types";

type Inputs = {
  a: string;
  b: string;
};
type Outputs = {
  out: string;
};

export default async function (
  _inputs: Inputs,
  context: Context<Inputs, Outputs>
): Promise<Outputs> {
  const res = await context.runBlock("counter11", { input: "test" });
  const data = await res.finish();
  console.log("Result from counter block:", data);
  if (data.error) {
    console.error("Error in counter block:", data.error);
  } else {
    throw new Error(
      "Expected an error, but got result: " + JSON.stringify(data.result)
    );
  }
  return { out: "out" };
}
