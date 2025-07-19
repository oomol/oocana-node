//#region generated meta
type Inputs = {};
type Outputs = {};
//#endregion

import type { Context } from "@oomol/oocana-types";
import { strict } from "assert";

export default async function (
  params: Inputs,
  context: Context<Inputs, Outputs>
): Promise<Partial<Outputs> | undefined | void> {
  // wrong input type
  const blockJob = context.runBlock(
    "self::additional",
    {
      inputs: { input: 1 },
    },
    true
  );
  blockJob.onOutput(data => {
    const entries = Object.entries(data);
    console.log(
      `Received output from counter block: handle=${entries[0][0]}, output=${entries[0][1]}`
    );
  });

  try {
    await Promise.race([
      blockJob.finish(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout waiting for counter block")),
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
}
