//#region generated meta
/**
 * @typedef {{input: any}} Inputs
 * @typedef {{output: any}} Outputs
 */
//#endregion

/**
 * @param {Inputs} params
 * @param {import("@oomol/types/oocana").Context<Inputs, Outputs>} context
 * @returns {Promise<Outputs>}
 */
export default async function (params, context) {
    if (params.array?.length) {
        for (let i = 0; i < params.array.length; i++) {
            await context.output("item", params.array[i]);
            await context.output("index", i);
            await context.output("length", params.array.length);
            await context.output("args", params.args);
        }
    }
}
