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
  const v1 = context.flowNodeStore["v1"];
  const v2 = context.flowNodeStore["v2"];

  if (v1 && v2) {
    throw new Error("v1 and v2 already exist");
  } else {
    context.flowNodeStore["v1"] = "v1";
    context.flowNodeStore["v2"] = "v2";
  }
  return { output: params.input };
}
