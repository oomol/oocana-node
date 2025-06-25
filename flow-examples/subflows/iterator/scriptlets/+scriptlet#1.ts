//#region generated meta
type Inputs = {
    input: any[];
};
type Outputs = {
    item: number;
    length: number;
};
//#endregion

import type { Context } from "@oomol/types/oocana";

export default async function(
    params: Inputs,
    context: Context<Inputs, Outputs>
): Promise<Partial<Outputs> | undefined | void> {

    for (let i=0; i < params.input.length; i++) {
        context.outputs({
            "item": params.input[i],
            length: params.input.length,
        })
    }
};
