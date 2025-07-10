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

  try {
    const data: any = await Promise.race([
      res.finish(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout waiting for counter block11")),
          5000
        )
      ),
    ]);
    console.log("Result from counter block:", data);
    if (data.error) {
      console.error("Error in counter block:", data.error);
    } else {
      throw new Error(
        "Expected an error, but got result: " + JSON.stringify(data.result)
      );
    }
  } catch (error) {
    throw new Error(
      "run block timeout error: " +
        (error instanceof Error ? error.message : String(error))
    );
  }

  return { out: "out" };
}
