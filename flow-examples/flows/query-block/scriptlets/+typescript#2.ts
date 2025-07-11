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
  let error = false;
  try {
    const res = await context.queryBlock("counter11");
  } catch (error) {
    console.error(
      "Error querying block 'counter11':",
      error instanceof Error ? error.message : String(error)
    );
    error = true;
  }

  if (error == false) {
    throw new Error("query block should fail, but it did not");
  }

  return { out: "out" };
}
