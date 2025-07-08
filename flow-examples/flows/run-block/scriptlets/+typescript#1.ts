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

  // Run the "counter" block with some input
  const res = await context.runBlock("counter", { input: "test" });
  res.onOutput(data => {
    const { handle, value } = data;
    console.log(
      `Received output from counter block: handle=${handle}, output=${value}`
    );
  });
  const { result, error } = await res.finish();
  if (error) {
    console.error("Error in counter block:", error);
    throw new Error("Counter block failed with error: " + error);
  } else {
    console.log("Result from counter block:", result);
  }
  return { a: "a", b: "b" };
}
