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
  try {
    const res = await context.queryBlock("self::counter");
    console.log("Query result from 'self::counter':", res);
  } catch (error) {
    throw new Error(
      "Error querying block 'self::counter': " +
        (error instanceof Error ? error.message : String(error))
    );
  }

  return { a: "a", b: "b" };
}
