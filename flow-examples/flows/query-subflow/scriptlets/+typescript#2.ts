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
  let fail = false;
  try {
    const res = await context.queryBlock("self::basic11");
    console.log("Query result from 'counter11':", res);
  } catch (error) {
    fail = true;
    console.error(
      "Error querying block 'counter11':",
      error instanceof Error ? error.message : String(error)
    );
  }

  if (fail == false) {
    throw new Error("query block should fail, but it did not");
  }

  return { out: "out" };
}
