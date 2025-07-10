import { Oocana } from "@oomol/oocana";
import { OocanaEventConfig } from "@oomol/oocana-types";
import { writeFile } from "fs/promises";
import { homedir, tmpdir } from "os";
import path from "path";
import { AnyEventData } from "remitter";
import { fileURLToPath } from "url";

export const flow_example = path.dirname(
  path.dirname(fileURLToPath(import.meta.url))
);
export const executorBin = path.join(
  flow_example,
  "..",
  "packages",
  "executor",
  "dist"
);
process.env["PATH"] = `${executorBin}:${process.env["PATH"]}`;

export async function runFlow(
  flow: string
): Promise<{ code: number; events: AnyEventData<OocanaEventConfig>[] }> {
  console.log(`run flow ${flow}`);
  const label = `run flow ${flow}`;
  console.time(label);

  const cli = new Oocana();
  await cli.connect();

  const events: AnyEventData<OocanaEventConfig>[] = [];
  cli.events.onAny(event => {
    // FIXME: current accept all session event，which cause some conflict when run multiple flow
    if (event.data.session_id === flow) {
      events.push(event);
    }
  });

  const task = await cli.runFlow({
    flowPath: path.join(flow_example, "flows", flow, "flow.oo.yaml"),
    searchPaths: [path.join(flow_example, "packages")].join(","),
    bindPaths: [`src=${homedir()}/.oocana,dst=/root/.oocana`],
    bindPathFile: await bindFile(),
    tempRoot: tmpdir(),
    debug: true,
    sessionId: flow,
    oomolEnvs: {
      VAR: "1",
    },
    envs: {
      VAR: "1",
    },
    envFile: path.join(flow_example, "executor.env"),
  });

  cli.events.on("BlockFinished", event => {
    if (event["error"]) {
      console.error("BlockFinished with error", event);
      throw new Error(`BlockFinished with error: ${event}`);
    }
  });

  task.addLogListener("stderr", data => {
    console.error("stderr", data.toString());
  });

  task.addLogListener("stdout", data => {
    console.log("stdout", data.toString());
  });

  const code = await task.wait();
  console.timeEnd(label);
  cli.dispose();

  return { code, events };
}

async function bindFile() {
  const content = `src=${flow_example}/executor.env,dst=/root/oocana/bind`;

  const p = `${tmpdir()}/bind.txt`;
  await writeFile(p, content);
  return p;
}
