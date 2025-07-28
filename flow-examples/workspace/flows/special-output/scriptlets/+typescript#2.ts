import type { Context } from "@oomol/types/oocana";
import { error } from "console";

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
  throw new Error("this node should never be executed")
}
