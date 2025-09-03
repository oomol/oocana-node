import { describe, it, expect, beforeAll } from "vitest";
import { Oocana, isPackageLayerEnable } from "@oomol/oocana";
import path from "node:path";
import { readdir } from "node:fs/promises";
import { homedir } from "node:os";
import { flow_examples, runFlow, workspace } from "./run";

describe(
  "Flow Tests",
  {
    timeout: 20 * 1000,
  },
  () => {
    let files: string[] = [];

    beforeAll(async () => {
      files = await readdir(path.join(workspace, "flows"));
      console.log("files", files);
    });

    it("run basic flow", async () => {
      const { code, events } = await runFlow("basic");
      expect(code).toBe(0);

      const startEvents = events.filter(e => e.event === "BlockStarted");
      expect(startEvents.length).toBe(3);

      const outputEvents = events.filter(e => e.event === "BlockOutputs");
      expect(
        outputEvents.filter(
          e => e.data.outputs?.a === "a" && e.data.outputs?.b === "b"
        ).length,
        `output events: ${JSON.stringify(outputEvents)}`
      ).toBe(1);

      const finishEvents = events.filter(e => e.event === "BlockFinished");

      expect(
        finishEvents.filter(
          e => e.data.result?.a === "a" && e.data.result?.b === "b"
        ).length,
        `finish ${JSON.stringify(finishEvents)}`
      ).toBe(1);

      const lastNode =
        finishEvents[finishEvents.length - 1]?.data.stacks?.[0].node_id;
      expect(lastNode).toBe("end");

      const sessionStarted = events.filter(e => e.event === "SessionStarted");
      const sessionFinished = events.filter(e => e.event === "SessionFinished");
      expect(sessionStarted.length).toBe(1);
      expect(sessionFinished.length).toBe(1);

      expect(sessionStarted[0].data.partial).not.toBeUndefined();
      expect(sessionFinished[0].data.partial).not.toBeUndefined();
    });

    it("run run-block flow", async () => {
      const { code, events } = await runFlow("run-block");
      expect(code).toBe(0);

      const startEvents = events.filter(e => e.event === "BlockStarted");
      expect(startEvents.length).toBe(5);

      const finishEvents = events.filter(e => e.event === "BlockFinished");
      expect(finishEvents.length).eq(5);
    });

    it("run run-subflow flow", async () => {
      const { code, events } = await runFlow("run-subflow");
      expect(code).toBe(0);
      const startEvents = events.filter(e => e.event === "BlockStarted");
      expect(startEvents.length).toBe(4);

      const finishEvents = events.filter(e => e.event === "BlockFinished");
      expect(finishEvents.length).eq(4);

      const lastNode =
        finishEvents[finishEvents.length - 1]?.data.stacks?.[0].node_id;
      expect(lastNode).toBe("end");
    });

    it("run subflow-progress flow", async () => {
      const { code, events } = await runFlow("subflow-progress");
      expect(code).toBe(0);
      const progressEvents = events.filter(e => e.event === "BlockProgress");

      expect(
        progressEvents.every(
          e => e.data.progress >= 0 && e.data.progress <= 100
        )
      ).toBe(true);

      expect(progressEvents.length).greaterThanOrEqual(
        8,
        `subflowProgress: ${JSON.stringify(progressEvents)}`
      );

      const latestFinished = events.findLast(e => e.event === "BlockFinished");
      const lastNode = latestFinished?.data.stacks?.[0].node_id;
      expect(lastNode).toBe("end");
    });

    it("run special-output flow", async () => {
      const { code, events } = await runFlow("special-output");
      expect(code).toBe(0);

      const latestFinished = events.findLast(e => e.event === "BlockFinished");
      const lastNode = latestFinished?.data.stacks?.[0].node_id;
      expect(lastNode).toBe("end");
    });

    it("run query-block flow", async () => {
      const { code, events } = await runFlow("query-block");
      expect(code).toBe(0);

      const latestFinished = events.findLast(e => e.event === "BlockFinished");
      const lastNode = latestFinished?.data.stacks?.[0].node_id;
      expect(lastNode).toBe("end");
    });

    it("run query-downstream flow", async () => {
      const { code, events } = await runFlow("query-downstream");
      expect(code).toBe(0);

      const latestFinished = events.findLast(e => e.event === "BlockFinished");
      const lastNode = latestFinished?.data.stacks?.[0].node_id;
      expect(lastNode).toBe("end");
    });

    it("run query-subflow flow", async () => {
      const { code, events } = await runFlow("query-subflow");
      expect(code).toBe(0);

      const latestFinished = events.findLast(e => e.event === "BlockFinished");
      const lastNode = latestFinished?.data.stacks?.[0].node_id;
      expect(lastNode).toBe("end");
    });

    it(
      "run pkg flow",
      async () => {
        const { code, events } = await runFlow("pkg");
        expect(code).toBe(0);

        const startEvents = events.filter(e => e.event === "BlockStarted");
        expect(startEvents.length).toBe(4);

        const finishEvents = events.filter(e => e.event === "BlockFinished");
        expect(finishEvents.length).eq(4);
      },
      {
        timeout: 40 * 1000,
      }
    );

    it("run run-pkg-block", async () => {
      if (await isPackageLayerEnable()) {
        const { code, events } = await runFlow("run-pkg-block");
        expect(code).toBe(0);

        // update count base on result
        const startEvents = events.filter(e => e.event === "BlockStarted");
        expect(startEvents.length).toBe(6);

        const finishEvents = events.filter(e => e.event === "BlockFinished");
        expect(finishEvents.length).eq(6);
      }
    });

    it("run var flow", async () => {
      const { code, events } = await runFlow("var");
      expect(code).toBe(0);

      const latestBlockOutput = events.findLast(
        e => e.event === "BlockFinished"
      )?.data?.result?.out;
      expect(latestBlockOutput).toBe("ok");

      const latestFinished = events.findLast(e => e.event === "BlockFinished");
      const lastNode = latestFinished?.data.stacks?.[0].node_id;
      expect(lastNode).toBe("end");
    });

    it("run bin flow", async () => {
      const { code, events } = await runFlow("bin");
      expect(code).toBe(0);

      const latestBlockLog = events.findLast(e => e.event === "BlockLog")?.data
        ?.log;
      expect(latestBlockLog).toBe(
        `str: ${Buffer.from("aaaa", "ascii").toString("base64")}`
      );

      const latestFinished = events.findLast(e => e.event === "BlockFinished");
      const lastNode = latestFinished?.data.stacks?.[0].node_id;
      expect(lastNode).toBe("end");
    });

    it("run esm flow", async () => {
      const { code, events } = await runFlow("esm");
      expect(code).toBe(0);

      const finishEvents = events.filter(e => e.event === "BlockFinished");
      expect(finishEvents.length).eq(2);
    });

    it("run from flow", async () => {
      const { code, events } = await runFlow("from");
      expect(code).toBe(0);

      const latestFinished = events.findLast(e => e.event === "BlockFinished");
      const lastNode = latestFinished?.data.stacks?.[0].node_id;
      expect(lastNode).toBe("end");
    });

    it("run nullable flow", async () => {
      const { code, events } = await runFlow("from");
      expect(code).toBe(0);

      const latestFinished = events.findLast(e => e.event === "BlockFinished");
      const lastNode = latestFinished?.data.stacks?.[0].node_id;
      expect(lastNode).toBe("end");
    });

    it("run additional-block flow", async () => {
      const { code, events } = await runFlow("additional-block");
      expect(code).toBe(0);

      const latestFinished = events.findLast(e => e.event === "BlockFinished");
      const lastNode = latestFinished?.data.stacks?.[0].node_id;
      expect(lastNode).toBe("end");
    });

    it("run progress flow", async () => {
      const { code, events } = await runFlow("progress");
      expect(code).toBe(0);

      const latestBlockOutput = events.findLast(e => e.event === "BlockOutput")
        ?.data?.output;
      expect(latestBlockOutput).toBe(3);

      const latestFinished = events.findLast(e => e.event === "BlockFinished");
      const lastNode = latestFinished?.data.stacks?.[0].node_id;
      expect(lastNode).toBe("end");
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

      const latestFinished = events.findLast(e => e.event === "BlockFinished");
      expect(latestFinished?.data.stacks?.[0].node_id).toBe("end");
    });

    it("run spawn flow", async () => {
      const { code, events } = await runFlow("spawn");
      expect(code).toBe(0);

      const finishEvents = events.filter(e => e.event === "BlockFinished");
      expect(finishEvents.length).eq(3);
    });

    it("run bind flow", async () => {
      if (await isPackageLayerEnable()) {
        const { code } = await runFlow("bind");
        expect(code).toBe(0);
      }
    });

    it("run tmp-dir flow", async () => {
      const { code, events } = await runFlow("tmp-dir");
      expect(code).toBe(0);

      const latestFinished = events.findLast(e => e.event === "BlockFinished");
      const lastNode = latestFinished?.data.stacks?.[0].node_id;
      expect(lastNode).toBe("end");
    });

    it("run pkg-dir flow", async () => {
      const { code, events } = await runFlow("pkg-dir");
      expect(code).toBe(0);

      const latestFinished = events.findLast(e => e.event === "BlockFinished");
      const lastNode = latestFinished?.data.stacks?.[0].node_id;
      expect(lastNode).toBe("end");
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

      const latestFinished = events.findLast(e => e.event === "BlockFinished");
      const lastNode = latestFinished?.data.stacks?.[0].node_id;
      expect(lastNode).toBe("end");
    });
  }
);

describe("stop flow", () => {
  it("stop running flow", async () => {
    const cli = new Oocana();
    await cli.connect();

    const task = await cli.runFlow({
      flowPath: path.join(workspace, "flows", "progress", "flow.oo.yaml"),
      searchPaths: [path.join(flow_examples, "packages")].join(","),
      bindPaths: [`src=${homedir()}/.oocana,dst=/root/.oocana`],
      sessionId: "stop",
      oomolEnvs: {
        VAR: "1",
      },
      envs: {
        VAR: "1",
      },
      pkgDataRoot: path.join(workspace, ".data"),
      projectData: workspace,
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
