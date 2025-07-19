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
  const blockJob = context.runBlock("sub::basic", {
    inputs: { input: "111" },
  });
  blockJob.onOutput(data => {
    const { handle, value } = data;
    console.log(
      `Received output from sub::basic: handle=${handle}, output=${value}`
    );
  });

  await Promise.race([
    blockJob.finish(),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Timeout waiting for sub::basic block")),
        5000
      )
    ),
  ]);
  return { out: "out" };
}
