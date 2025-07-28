//#region generated meta
/**
 * @typedef {{
 *   result: any[];
 *   add: number;
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
  const { result, add } = params;
  for (let i=0; i<result.length; i++) {
    if (result[i] !== i + 1 + add) {
      throw new Error(`input ${i} is ${result[i]}, expected ${i + 1 + add}`)
    }
  }
  return { output: params.result };
}
