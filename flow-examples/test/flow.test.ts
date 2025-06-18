import { describe, it, expect, beforeAll } from "vitest";
import { Oocana, isPackageLayerEnable } from "@oomol/oocana";
import path from "node:path";
import { readdir } from "node:fs/promises";
import { homedir } from "node:os";
import { flow_example, runFlow } from "./run";

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

    it("run basic flow", async () => {
      const { code, events } = await runFlow("basic");
      expect(code).toBe(0);
      expect(
        events.filter(e => e.event === "BlockStarted").length,
        `start ${events
          .filter(e => e.event === "BlockStarted")
          .map(e => JSON.stringify(e.data.stacks))}`
      ).toBe(3);

      expect(
        events
          .filter(e => e.event === "BlockOutputs")
          .filter(e => e.data.outputs?.a === "a" && e.data.outputs?.b === "b")
          .length,
        `finish ${events
          .filter(e => e.event === "BlockFinished")
          .map(e => JSON.stringify(e.data.stacks))}`
      ).toBe(1);

      expect(
        events
          .filter(e => e.event === "BlockFinished")
          .filter(e => e.data.result?.a === "a" && e.data.result?.b === "b")
          .length,
        `finish ${events
          .filter(e => e.event === "BlockFinished")
          .map(e => JSON.stringify(e.data.stacks))}`
      ).toBe(1);

      const events_list = events.map(e => e.event);

      const sessionStarted = events.filter(e => e.event === "SessionStarted");
      const sessionFinished = events.filter(e => e.event === "SessionFinished");
      expect(sessionStarted.length).toBe(1);
      expect(sessionFinished.length).toBe(1);

      expect(sessionStarted[0].data.partial).not.toBeUndefined();
      expect(sessionFinished[0].data.partial).not.toBeUndefined();
    });

    it("run pkg flow", async () => {
      const { code, events } = await runFlow("pkg");
      expect(code).toBe(0);
      expect(
        events.filter(e => e.event === "BlockStarted").length,
        `start ${events
          .filter(e => e.event === "BlockStarted")
          .map(e => JSON.stringify(e.data.stacks))}`
      ).toBe(4);

      const events_list = events.map(e => e.event);
      expect(events_list).toContain("SessionFinished");
    });

    it("run var flow", async () => {
      const { code, events } = await runFlow("var");
      expect(code).toBe(0);

      const latestBlockOutput = events.findLast(
        e => e.event === "BlockFinished"
      )?.data?.result?.out;
      expect(latestBlockOutput).toBe("ok");
    });

    it("run bin flow", async () => {
      const { code, events } = await runFlow("bin");
      expect(code).toBe(0);

      const latestBlockLog = events.findLast(e => e.event === "BlockLog")?.data
        ?.log;
      expect(latestBlockLog).toBe(
        `str: ${Buffer.from("aaaa", "ascii").toString("base64")}`
      );
    });

    it("run esm flow", async () => {
      const { code } = await runFlow("esm");
      expect(code).toBe(0);
    });

    it("run progress flow", async () => {
      const { code, events } = await runFlow("progress");
      expect(code).toBe(0);

      const latestBlockOutput = events.findLast(e => e.event === "BlockOutput")
        ?.data?.output;
      expect(latestBlockOutput).toBe(3);
    });

    it("run warning flow", async () => {
      const { code, events } = await runFlow("warning");
      expect(code).toBe(0);

      const latestBlockWarning = events.findLast(
        e => e.event === "BlockWarning"
      )?.data?.warning;
      expect(latestBlockWarning).toBe(
        "Output handle key: [c] is not defined in Block outputs schema."
      );
    });

    it("run service flow", async () => {
      const { code, events } = await runFlow("service");
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
        const { code } = await runFlow("inject");
        expect(code).toBe(0);
      }
    });

    it("run triple flow", async () => {
      if (await isPackageLayerEnable()) {
        const { code } = await runFlow("triple");
        expect(code).toBe(0);
      }
    });

    it("run value flow", async () => {
      const { code, events } = await runFlow("value");
      expect(code).toBe(0);
      const output = events.findLast(e => e.event === "BlockFinished")?.data
        ?.result?.out;
      expect(output).toEqual("static");
    });

    it("run spawn flow", async () => {
      const { code } = await runFlow("spawn");
      expect(code).toBe(0);
    });

    it("run bind flow", async () => {
      if (await isPackageLayerEnable()) {
        const { code } = await runFlow("bind");
        expect(code).toBe(0);
      }
    });

    it("run tmp-dir flow", async () => {
      const { code } = await runFlow("tmp-dir");
      expect(code).toBe(0);
    });

    it("run pkg-dir flow", async () => {
      const { code } = await runFlow("pkg-dir");
      expect(code).toBe(0);
    });
  }
);

describe("stop flow", () => {
  it("stop running flow", async () => {
    const cli = new Oocana();
    await cli.connect();

    const task = await cli.runFlow({
      flowPath: path.join(flow_example, "flows", "progress", "flow.oo.yaml"),
      searchPaths: [
        path.join(flow_example, "blocks"),
        path.join(flow_example, "packages"),
      ].join(","),
      bindPaths: [`src=${homedir()}/.oocana,dst=/root/.oocana`],
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
