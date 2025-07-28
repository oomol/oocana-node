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
  // @ts-ignore wrong block resource name
  const blockJob = context.runBlock("counter11", {
    inputs: { input: "test" },
  });

  try {
    await Promise.race([
      blockJob.finish(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout waiting for counter block11")),
          5000
        )
      ),
    ]);
    throw new Error("Expected an error");
  } catch (error) {
    if ((error as any)?.message?.includes("Timeout")) {
      console.error(error);
      throw new Error("run block timed out");
    }
  }

  return { out: "out" };
}
