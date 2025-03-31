//#region generated meta
/**
 * @typedef {{
 *   input: string;
 * }} Inputs
 * @typedef {{
 *   output: string;
 * }} Outputs
 */
//#endregion
import fs from "fs/promises";
/**
 * @param {Inputs} params
 * @param {import("@oomol/types/oocana").Context<Inputs, Outputs>} context
 * @returns {Promise<Outputs>}
 */
export default async function (params, context) {

  let p = context.tmpDir;
  let output = p + "/output.txt";

  await fs.writeFile(output, "Hello World");


  return { output };
}
