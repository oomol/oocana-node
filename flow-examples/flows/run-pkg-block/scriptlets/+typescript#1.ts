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
  const blockJob = context.runBlock("merge::merge", {
    inputs: { one: "111" },
  });
  blockJob.onOutput(data => {
    const { handle, value } = data;
    console.log(
      `Received output from merge block: handle=${handle}, output=${value}`
    );
  });

  await Promise.race([
    blockJob.finish(),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Timeout waiting for merge block")),
        5000
      )
    ),
  ]);
  return { a: "a", b: "b" };
}
