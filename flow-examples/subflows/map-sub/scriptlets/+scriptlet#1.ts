//#region generated meta
import type { Context } from "@oomol/types/oocana";
type Inputs = {
    input: any;
}
type Outputs = {
    output: any;
}
//#endregion

export default async function(
    params: Inputs,
    context: Context<Inputs, Outputs>
): Promise<Partial<Outputs> | undefined | void> {

    // your code

    return { output: params.input };
};
