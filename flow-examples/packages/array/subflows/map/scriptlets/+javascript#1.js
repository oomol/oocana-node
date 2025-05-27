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

    const reducer = params.reducer || { mark: [], array: [] }

    reducer.mark[params.index] = true;
    reducer.array[params.index] = params.item;

    if (reducer.mark.reduce((sum, m) => sum + (m ? 1 : 0), 0) === params.length) {
        return { array: reducer.array }
    } else {
        return { reducer }
    }
}
