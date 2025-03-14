import type { Context } from "@oomol/types/oocana";

//#region generated meta
type Inputs = {
  input: string;
}
type Outputs = {
  output: string;
}
//#endregion

export default async function(
  params: Inputs,
  context: Context<Inputs, Outputs>
): Promise<Outputs> {

  // your code
  process.env["a"] = "aa";

  return { output: "output_value" };
};
