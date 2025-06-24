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
    throw new Error("a is set")
  } else {
    console.log("a is unset", a)
  }

  return { output: "output_value" };
};
