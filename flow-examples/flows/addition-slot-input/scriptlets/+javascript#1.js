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

/**
 * @param {Inputs} params
 * @param {import("@oomol/types/oocana").Context<Inputs, Outputs>} context
 * @returns {Promise<Outputs>}
 */
export default async function (params, context) {
  const { input } = params;
  if (input !== "input" && input !== "inputbbbb") {
    throw new Error("Invalid input: " + input);
  }
  return { output: params.input, b: "bbbb" };
}
