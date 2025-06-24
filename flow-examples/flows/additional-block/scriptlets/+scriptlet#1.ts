//#region generated meta
type Inputs = {
};
type Outputs = {
    output: any;
    output1: any;
};
//#endregion

import type { Context } from "@oomol/types/oocana";

export default async function(
    params: Inputs,
    context: Context<Inputs, Outputs>
): Promise<Partial<Outputs> | undefined | void> {

    // your code

    return { output: "output_value", output1: "111" };
};
