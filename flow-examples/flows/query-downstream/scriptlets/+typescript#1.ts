import type { Context } from "@oomol/oocana-types";
import { dequal } from "dequal";
type Inputs = {
  in: unknown;
};
type Outputs = {
  a: string;
  b: string;
};

export default async function (
  _inputs: Inputs,
  context: Context<Inputs, Outputs>
): Promise<Outputs> {
  const downstream = await context.queryDownstream();
  console.log("Downstream query result:", downstream);

  let eq = dequal(downstream["a"], {
    to_node: [
      {
        node_id: "end",
        description: "node description",
        input_handle: "a",
        input_handle_def: {
          handle: "a",
          value: "input value",
        },
      },
    ],
  });

  if (!eq) {
    throw new Error(
      "Downstream query did not return expected value for 'a'" +
        JSON.stringify(downstream["a"])
    );
  }

  return { a: "a", b: "b" };
}
