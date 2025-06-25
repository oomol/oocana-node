//#region generated meta
/**
 * @typedef {{
 *   input: string;
 * }} Inputs;
 * @typedef {{
 *   array: any[];
 * }} Outputs;
 */
//#endregion

/**
 * @param {Inputs} params
 * @param {import("@oomol/types/oocana").Context<Inputs, Outputs>} context
 * @returns {Promise<Outputs>}
 */
export default async function (params, context) {
  const { input } = params;
  return { array: [1, 2, 3] };
}
