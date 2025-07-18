//#region generated meta
type Inputs = {};
type Outputs = {};
//#endregion

import type { Context } from "@oomol/types/oocana";

export default async function (
  params: Inputs,
  context: Context<Inputs, Outputs>
): Promise<Partial<Outputs> | undefined | void> {
  // wrong input type
  const res = await context.runBlock("self::additional", {
    inputs: { input: 1 },
  });
  res.onOutput(data => {
    const { handle, value } = data;
    console.log(
      `Received output from counter block: handle=${handle}, output=${value}`
    );
  });

  let failed = false;
  try {
    const resolve: any = await Promise.race([
      res.finish(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout waiting for counter block")),
          5000
        )
      ),
    ]);
    const { result, error } = resolve;
    if (error) {
      failed = true;
      throw new Error("Counter block failed with error: " + error);
    } else {
      console.log("Result from counter block:", result);
    }
  } catch (error) {
    console.error("Error:", error);
  }

  if (failed == false) {
    throw new Error("except error");
  }
}
