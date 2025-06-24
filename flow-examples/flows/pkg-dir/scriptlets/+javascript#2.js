//#region generated meta
/**
 * @typedef {{
 *   input: string;
 * }} Inputs;
 * @typedef {{
 *   output: string;
 * }} Outputs;
 */
//#endregion

import fs from "fs/promises";

/**
 * @param {Inputs} params
 * @param {import("@oomol/types/oocana").Context<Inputs, Outputs>} context
 * @returns {Promise<Outputs>}
 */
export default async function (params, context) {

  let f = params["input"]

  console.log(f);
  const ls = await fs.lstat(f);
  console.log(ls);

  return { output: "output_value" };
}
