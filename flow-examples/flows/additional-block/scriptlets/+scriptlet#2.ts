//#region generated meta
type Inputs = {
    input: any;
    output1: any;
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

    if (params.input === "output_value111") {
        return {output: "1"}
    }

    throw new Error("This is a test error")
};
