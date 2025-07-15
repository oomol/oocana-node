//#region generated meta
type Inputs = {};
type Outputs = {
  output: any;
};
//#endregion

import type { Context } from "@oomol/oocana-types";

export default async function (
  _params: Inputs,
  context: Context<Inputs, Outputs>
): Promise<Partial<Outputs> | undefined | void> {
  context.output("output", "aaa", {
    to_node: [
      {
        node_id: "end",
        input_handle: "a",
      },
    ],
  });
}
