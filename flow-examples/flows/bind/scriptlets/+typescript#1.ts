import type { Context } from "@oomol/oocana-types";
import { stat } from "fs/promises";
// "in", "out" is the default node key.
// Redefine the name and type of the node, change it manually below.
// Click on the gear(⚙) to configure the input output UI
type Inputs = Readonly<{ in: unknown }>;
type Outputs = Readonly<{ out: unknown }>;

export default async function (
  _inputs: Inputs,
  _context: Context<Inputs, Outputs>
): Promise<Outputs> {
  const bindPath = `/root/oocana/bind`;

  const s = await stat(bindPath);
  if (s.isFile()) {
    console.log("bind path is a file");
  } else {
    throw new Error("bind path is not a file, get " + s);
  }

  return { out: bindPath };
}
