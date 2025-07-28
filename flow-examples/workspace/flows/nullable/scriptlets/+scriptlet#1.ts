//#region generated meta
type Inputs = {
    input: any;
};
type Outputs = {
    output: any;
};
//#endregion

import type { Context } from "@oomol/types/oocana";

export default async function(
    params: Inputs,
    context: Context<Inputs, Outputs>
): Promise<Partial<Outputs> | undefined | void> {

    if (params.input === null) {
        console.log(params.input)
    } else {
        throw new Error("Expected null")
    }

    return { output: "output_value" };
};
