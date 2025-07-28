import type { Context } from "@oomol/types/oocana";

type Inputs = {
  a: string;
  b: string;
};
type Outputs = {
  out: string;
};

export default async function (
  _inputs: Inputs,
  _context: Context<Inputs, Outputs>
): Promise<Outputs> {
  return { out: "out" };
}
