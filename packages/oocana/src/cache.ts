import { spawn } from "node:child_process";
import { join } from "node:path";
import { Cli } from "./cli";

async function cleanCache({ bin }: { bin?: string }) {
  const oocanaPath = bin ?? join(__dirname, "..", "oocana");

  const cli = new Cli(spawn(oocanaPath, ["cache", "clear"]));
  return cli;
}

export { cleanCache };
