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

    console.log("inputsDef", context.inputsDef);
    console.log("outputsDef", context.outputsDef);

    let merged = "";
    for (const key in context.inputsDef) {
        merged += params[key];
    }

    for (const key in context.outputsDef) {
        context.output(key as any, merged);
    }
};
