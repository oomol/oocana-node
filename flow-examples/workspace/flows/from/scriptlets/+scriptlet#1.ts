//#region generated meta
type Inputs = {
    input: any;
    output: number;
    value1: number;
};
type Outputs = {
    output: number;
};
//#endregion

import type { Context } from "@oomol/types/oocana";

export default async function(
    params: Inputs,
    context: Context<Inputs, Outputs>
): Promise<Partial<Outputs> | undefined | void> {

    // your code

    return { output: params.input + params.output + params.value1 };
};
