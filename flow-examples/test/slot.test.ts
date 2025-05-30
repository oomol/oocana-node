import { it, expect } from "vitest";
import { runFlow } from "./run";
import { describe } from "node:test";

describe("slot test", () => {
  it("run slot-task flow", async () => {
    const { code, events } = await runFlow("slot-task");
    const e = events.filter(
      e =>
        e.event === "BlockFinished" &&
        e.data.stacks.filter(e => e.node_id === "node-2").length == 1
    );
    expect(e.length).toBe(1);
    expect(code).toBe(0);
  });

  it("run slot-inline flow with bind", async () => {
    const { code, events } = await runFlow("slot-inline");
    const e = events.filter(
      e =>
        e.event === "BlockFinished" &&
        e.data.stacks.filter(e => e.node_id === "node-2").length == 1
    );
    expect(e.length).toBe(1);
    expect(code).toBe(0);
  });

  it("run map-slot-inline flow", async () => {
    const { code, events } = await runFlow("map-slot-inline");
    expect(code).toBe(0);
    const slotflowOutputs = events.filter(e => e.event === "SlotflowOutput");
    expect(slotflowOutputs.length).toBe(2);
    expect(
      slotflowOutputs[0].data.output,
      JSON.stringify(slotflowOutputs[0])
    ).toEqual("aaa");

    expect(
      slotflowOutputs[1].data.output,
      JSON.stringify(slotflowOutputs[1])
    ).toEqual("bbb");

    const subflowOutputs = events.filter(e => e.event === "SubflowBlockOutput");
    expect(subflowOutputs.length, JSON.stringify(subflowOutputs)).toBe(2);
    expect(
      subflowOutputs[0].data.output,
      JSON.stringify(subflowOutputs[0])
    ).toEqual(["aaa", "bbb"]);

    expect(
      subflowOutputs[1].data.output,
      JSON.stringify(subflowOutputs[1])
    ).toEqual(["aaa", "bbb"]);
  });

  it("run slot-subflow flow with bind", async () => {
    const { code, events } = await runFlow("slot-subflow");
    const e = events.filter(
      e =>
        e.event === "BlockFinished" &&
        e.data.stacks.filter(e => e.node_id === "node-2").length == 1
    );
    expect(e.length).toBe(1);
    expect(code).toBe(0);
  });
});

describe("slotflow test", () => {
  it("run slotflow flow", async () => {
    const { code, events } = await runFlow("slot-slotflow");
    const e = events.filter(
      e =>
        e.event === "BlockFinished" &&
        e.data.stacks.filter(e => e.node_id === "node-2").length == 1
    );
    expect(e.length).toBe(1);
    expect(code).toBe(0);
  });
});

describe("package slot test", () => {
  it("run pkg slot-task flow", async () => {
    const { code, events } = await runFlow("pkg-slot-task");
    const e = events.filter(
      e =>
        e.event === "BlockFinished" &&
        e.data.stacks.filter(e => e.node_id === "node-2").length == 1
    );
    expect(e.length).toBe(1);
    expect(code).toBe(0);
  });

  it("run pkg slot-inline flow", async () => {
    const { code, events } = await runFlow("pkg-slot-inline");
    const e = events.filter(
      e =>
        e.event === "BlockFinished" &&
        e.data.stacks.filter(e => e.node_id === "node-2").length == 1
    );
    expect(e.length).toBe(1);
    expect(code).toBe(0);
  });

  it("run pkg slot-subflow flow", async () => {
    const { code, events } = await runFlow("pkg-slot-subflow");
    const e = events.filter(
      e =>
        e.event === "BlockFinished" &&
        e.data.stacks.filter(e => e.node_id === "node-2").length == 1
    );
    expect(e.length).toBe(1);
    expect(code).toBe(0);
  });
});
