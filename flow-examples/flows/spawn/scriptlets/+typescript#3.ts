import type { Context } from "@oomol/types/oocana";

//#region generated meta
type Inputs = {
  input: string;
};
type Outputs = {
  output: string;
};
//#endregion

export default async function(
  params: Inputs,
  context: Context<Inputs, Outputs>
): Promise<Outputs> {

  // your code
  const a = process.env["a"]
  if (!!a) {
    console.log("a is set", a)
  } else {
    throw new Error("a is unset, maybe not inject to spawn node")
  }

  return { output: "output_value" };
};
