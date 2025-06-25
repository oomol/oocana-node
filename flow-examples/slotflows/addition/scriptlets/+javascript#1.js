//#region generated meta
/**
 * @typedef {{
 *   input: string;
 *   add: any;
 *   addd: string;
 *   adddd: any;
 * }} Inputs;
 * @typedef {{
 *   output: string;
 * }} Outputs;
 */
//#endregion

/**
 * @param {Inputs} params
 * @param {import("@oomol/types/oocana").Context<Inputs, Outputs>} context
 * @returns {Promise<Outputs>}
 */
export default async function (params, context) {
  return { output: params.input + params.add };
}
