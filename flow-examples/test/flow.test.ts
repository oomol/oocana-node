import { describe, it, expect, beforeAll } from "vitest";
import { Oocana, isPackageLayerEnable } from "@oomol/oocana";
import type { OocanaEventConfig } from "@oomol/oocana-types";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readdir, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import type { AnyEventData } from "remitter";

const flow_example = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const executorBin = path.join(
  flow_example,
  "..",
  "packages",
  "executor",
  "dist"
);
process.env["PATH"] = `${executorBin}:${process.env["PATH"]}}`;

describe(
  "Flow Tests",
  {
    timeout: 20 * 1000,
  },
  () => {
    let files: string[] = [];

    beforeAll(async () => {
      files = await readdir(path.join(flow_example, "flows"));
      console.log("files", files);
    });

    it("run pkg flow", async () => {
      const { code, events } = await run("pkg");
      expect(code).toBe(0);
      expect(events.filter(e => e.event === "BlockStarted").length).toBe(4);

      const events_list = events.map(e => e.event);
      expect(events_list).toContain("SessionFinished");
    });

    it("run var flow", async () => {
      const { code, events } = await run("var");
      expect(code).toBe(0);

      const latestBlockOutput = events.findLast(e => e.event === "BlockOutput")
        ?.data?.output;
      expect(latestBlockOutput).toBe("ok");
    });

    it("run bin flow", async () => {
      const { code, events } = await run("bin");
      expect(code).toBe(0);

      const latestBlockLog = events.findLast(e => e.event === "BlockLog")?.data
        ?.log;
      expect(latestBlockLog).toBe(
        `str: ${Buffer.from("aaaa", "ascii").toString("base64")}`
      );
    });

    it("run esm flow", async () => {
      const { code } = await run("esm");
      expect(code).toBe(0);
    });

    it("run progress flow", async () => {
      const { code, events } = await run("progress");
      expect(code).toBe(0);

      const latestBlockOutput = events.findLast(e => e.event === "BlockOutput")
        ?.data?.output;
      expect(latestBlockOutput).toBe(3);
    });

    it("run service flow", async () => {
      const { code, events } = await run("service");
      expect(code).toBe(0);

      const latestBlockWarning = events.findLast(
        e => e.event === "BlockWarning"
      )?.data?.warning;
      expect(latestBlockWarning).toBe(
        "Output handle key: [app] is not defined in Block outputs schema."
      );
    });

    it("run inject flow", async () => {
      if (await isPackageLayerEnable()) {
        const { code } = await run("inject");
        expect(code).toBe(0);
      }
    });

    it("run triple flow", async () => {
      if (await isPackageLayerEnable()) {
        const { code } = await run("triple");
        expect(code).toBe(0);
      }
    });

    it("run value flow", async () => {
      const { code, events } = await run("value");
      expect(code).toBe(0);
      const output = events.findLast(e => e.event === "BlockOutput")?.data
        ?.output;
      expect(output).toEqual(null);
    });

    it("run spawn flow", async () => {
      const { code } = await run("spawn");
      expect(code).toBe(0);
    });

    it("run bind flow", async () => {
      if (await isPackageLayerEnable()) {
        const { code } = await run("bind");
        expect(code).toBe(0);
      }
    });
  }
);

describe("stop flow", () => {
  it("stop running flow", async () => {
    const cli = new Oocana();
    await cli.connect();

    const task = await cli.runFlow({
      flowPath: path.join(flow_example, "flows", "progress", "flow.oo.yaml"),
      blockSearchPaths: [
        path.join(flow_example, "blocks"),
        path.join(flow_example, "packages"),
      ].join(","),
      extraBindPaths: [`${homedir()}/.oocana:/root/.oocana`],
      sessionId: "stop",
      oomolEnvs: {
        VAR: "1",
      },
      envs: {
        VAR: "1",
      },
    });

    task.kill();
    await new Promise(resolve => setTimeout(resolve, 1000));
    const isRunning = task.isRunning();
    expect(isRunning).toBe(false);

    const code = await task.wait();
    expect(code).toBe(-1);

    cli.dispose();
  });
});

async function run(
  flow: string
): Promise<{ code: number; events: AnyEventData<OocanaEventConfig>[] }> {
  console.log(`run flow ${flow}`);
  const label = `run flow ${flow}`;
  console.time(label);

  const cli = new Oocana();
  await cli.connect();

  const events: AnyEventData<OocanaEventConfig>[] = [];
  cli.events.onAny(event => {
    events.push(event);
  });

  const task = await cli.runFlow({
    flowPath: path.join(flow_example, "flows", flow, "flow.oo.yaml"),
    blockSearchPaths: [
      path.join(flow_example, "blocks"),
      path.join(flow_example, "packages"),
    ].join(","),
    bindPaths: [`${homedir()}/.oocana:/root/.oocana`],
    bindPathFile: await bindFile(),
    tmpRoot: tmpdir(),
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
  const content = `${flow_example}/executor.env:/root/oocana/bind`;

  const p = `${tmpdir()}/bind.txt`;
  await writeFile(p, content);
  return p;
}
