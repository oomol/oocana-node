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
  const blockJob = context.runBlock("self::counter", {
    inputs: { input: "test" },
  });
  blockJob.onOutput(data => {
    const entries = Object.entries(data);
    console.log(
      `Received output from counter block: handle=${entries[0][0]}, output=${entries[0][1]}`
    );
  });

  await Promise.race([
    blockJob.finish(),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Timeout waiting for counter block")),
        5000
      )
    ),
  ]);
  return { a: "a", b: "b" };
}
