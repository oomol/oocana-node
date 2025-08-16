import { it, expect } from "vitest";
import { runFlow } from "./run";
import { describe } from "node:test";

describe("slot test", () => {
  it("run slot-task flow", async () => {
    const { code, events } = await runFlow("slot-task");
    const latestFinished = events.findLast(e => e.event === "BlockFinished");
    expect(latestFinished?.data.stacks?.[0].node_id).toBe("end");
    expect(code).toBe(0);
  });

  it("run slot-subflow flow with bind", async () => {
    const { code, events } = await runFlow("slot-subflow");
    const latestFinished = events.findLast(e => e.event === "BlockFinished");
    expect(latestFinished?.data.stacks?.[0].node_id).toBe("end");
    expect(code).toBe(0);
  });
});

describe("slotflow test", () => {
  it("run slotflow flow", async () => {
    const { code, events } = await runFlow("slot-slotflow");
    const latestFinished = events.findLast(e => e.event === "BlockFinished");
    expect(latestFinished?.data.stacks?.[0].node_id).toBe("end");

    const slotflowFinished = events.filter(e => e.event === "SlotflowFinished");
    expect(slotflowFinished.length).toBe(1);

    const slotflowStarted = events.filter(e => e.event === "SlotflowStarted");
    expect(slotflowStarted.length).toBe(1);

    expect(code).toBe(0);
  });
});

describe("package slot test", () => {
  it("run pkg slot-task flow", async () => {
    const { code, events } = await runFlow("pkg-slot-task");
    const latestFinished = events.findLast(e => e.event === "BlockFinished");
    expect(latestFinished?.data.stacks?.[0].node_id).toBe("end");
    expect(code).toBe(0);
  });

  it("run pkg slot-subflow flow", async () => {
    const { code, events } = await runFlow("pkg-slot-subflow");
    const latestFinished = events.findLast(e => e.event === "BlockFinished");
    expect(latestFinished?.data.stacks?.[0].node_id).toBe("end");
    expect(code).toBe(0);
  });

  it("run addition-slot-input flow", async () => {
    const { code, events } = await runFlow("addition-slot-input");
    const latestFinished = events.findLast(e => e.event === "BlockFinished");
    expect(latestFinished?.data.stacks?.[0].node_id).toBe("end");
    expect(code).toBe(0);
  });
});
