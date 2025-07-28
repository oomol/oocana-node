import type { Context } from "@oomol/types/oocana";

type Inputs = {
  a: unknown;
};
type Outputs = {
  out: unknown;
};

export default async function (
  inputs: Inputs,
  context: Context<Inputs, Outputs>
): Promise<Outputs> {
  const { a } = inputs;
  console.log("log input:" + a);
  if (a != null && typeof a === "object") {
    return { out: "ok" };
  } else {
    throw new Error("Invalid input");
  }
}
