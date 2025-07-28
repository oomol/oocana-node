//#region generated meta
type Inputs = {
    input: any;
    length: number;
};
type Outputs = {
    output: any[];
};
//#endregion

let store = {}

import type { Context } from "@oomol/types/oocana";

export default async function(
    params: Inputs,
    context: Context<Inputs, Outputs>
): Promise<Partial<Outputs> | undefined | void> {
    const id = context.stacks[context.stacks.length - 1].flow_job_id;
    let id_store = store[id] || [];
    id_store.push(params.input)
    store[id] = id_store;

    if (id_store.length === params.length) {
        store[id] = [];
        return {output: id_store}
    }
};
