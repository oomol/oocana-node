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
  const res = await context.runBlock("sub::basic", {
    inputs: { input: "111" },
  });
  res.onOutput(data => {
    const { handle, value } = data;
    console.log(
      `Received output from sub::basic: handle=${handle}, output=${value}`
    );
  });

  try {
    const resolve: any = await Promise.race([
      res.finish(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout waiting for sub::basic block")),
          5000
        )
      ),
    ]);
    const { result, error } = resolve;
    if (error) {
      throw new Error("sub::basic block failed with error: " + error);
    } else {
      console.log("Result from sub::basic block:", result);
    }
  } catch (error) {
    throw new Error(
      "run block timeout error: " +
        (error instanceof Error ? error.message : String(error))
    );
  }
  return { out: "out" };
}
