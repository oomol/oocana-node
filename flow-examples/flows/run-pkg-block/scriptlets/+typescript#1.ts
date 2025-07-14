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
  const res = await context.runBlock("merge::merge", {
    inputs: { one: "111" },
  });
  res.onOutput(data => {
    const { handle, value } = data;
    console.log(
      `Received output from merge block: handle=${handle}, output=${value}`
    );
  });

  try {
    const resolve: any = await Promise.race([
      res.finish(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout waiting for merge block")),
          5000
        )
      ),
    ]);
    const { result, error } = resolve;
    if (error) {
      throw new Error("Counter merge failed with error: " + error);
    } else {
      console.log("Result from merge block:", result);
    }
  } catch (error) {
    throw new Error(
      "run block timeout error: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
  return { a: "a", b: "b" };
}
