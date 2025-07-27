import { describe, it, expect } from "vitest";
import { isPackageLayerEnable, Oocana } from "@oomol/oocana";
import path from "node:path";
import { homedir, tmpdir } from "node:os";
import { flow_example } from "./run";
import { randomUUID } from "node:crypto";
import { writeFile } from "fs/promises";
import { OocanaEventConfig } from "@oomol/oocana-types";
import { AnyEventData } from "remitter";

describe("Block test", () => {
  it("run block in layer", async () => {
    if (!(await isPackageLayerEnable())) {
      return;
    }
    const { code, events } = await runBlock(
      path.join(
        flow_example,
        "packages",
        "check",
        "blocks",
        "check",
        "block.oo.yaml"
      ),
      "block",
      { one: "test" }
    );
    expect(code).toBe(0);
    expect(events.length).toBeGreaterThan(0);
    let BlockFinishEvent = events.filter(
      event => event.data.type === "BlockFinished"
    );
    expect(BlockFinishEvent.length).toBe(1);
  });

  it("run aaa", async () => {
    const { code, events } = await runBlock(
      path.join(flow_example, "blocks", "aaa", "block.oo.yaml"),
      "aaa",
      { input: "test" }
    );
    expect(code).toBe(0);
    expect(events.length).toBeGreaterThan(0);

    let BlockFinishEvent = events.filter(
      event => event.data.type === "BlockFinished"
    );
    expect(BlockFinishEvent.length).toBe(1);
  });
});

async function runBlock(
  blockPath: string,
  sessionId: string = randomUUID(),
  inputs: Record<string, any>
): Promise<{ code: number; events: AnyEventData<OocanaEventConfig>[] }> {
  const cli = new Oocana();
  await cli.connect();

  const events: any[] = [];
  cli.events.onAny(event => {
    if (event.data.session_id === sessionId) {
      events.push(event);
    }
  });

  const task = await cli.runBlock({
    blockPath,
    inputs,
    bindPaths: [`src=${homedir()}/.oocana,dst=/root/.oocana`],
    bindPathFile: await bindFile(),
    tempRoot: path.join(flow_example, ".temp"),
    debug: true,
    sessionId,
    oomolEnvs: {
      VAR: "1",
    },
    envs: {
      VAR: "1",
    },
    envFile: path.join(flow_example, "executor.env"),
    pkgDataRoot: path.join(flow_example, ".data"),
    projectData: flow_example,
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
  cli.dispose();

  return { code, events };
}

async function bindFile() {
  const content = `src=${flow_example}/executor.env,dst=/root/oocana/bind`;

  const p = `${tmpdir()}/bind.txt`;
  await writeFile(p, content);
  return p;
}
