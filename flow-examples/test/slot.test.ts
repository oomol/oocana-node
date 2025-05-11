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
