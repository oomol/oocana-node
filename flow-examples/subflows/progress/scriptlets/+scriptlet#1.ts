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

    for (let i = 0; i < 4; i++) {
        await new Promise(r => setTimeout(r, 1000));
        context.reportProgress(i * 25)
    }

    return { output: "output_value" };
};
