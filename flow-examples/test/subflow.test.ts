import { it, expect, describe } from "vitest";
import { runFlow } from "./run";

describe("subflow test", () => {
  it("run sub flow", async () => {
    const { code, events } = await runFlow("sub");

    const startedJobs = events
      .filter(e => e.event === "BlockStarted")
      .map(e => e.data.job_id);

    const finishedJobs = events
      .filter(e => e.event === "BlockFinished")
      .map(e => e.data.job_id);

    expect(
      startedJobs.length,
      `started jobs count: ${startedJobs.length} not eq finished jobs count: ${finishedJobs.length}`
    ).eq(finishedJobs.length);
    expect(
      startedJobs.length,
      `started job evens ${JSON.stringify(startedJobs)}`
    ).eq(3);

    const latestFinished = events.findLast(e => e.event === "BlockFinished");
    expect(latestFinished?.data.stacks?.[0].node_id).toBe("end");

    expect(code).toBe(0);
  });

  it("run sub flow", async () => {
    const { code, events } = await runFlow("one-subflow-twice-subflow-node");
    expect(code).toBe(0);

    const latestFinished = events.findLast(e => e.event === "BlockFinished");
    expect(latestFinished?.data.stacks?.[0].node_id).toBe("end");
  });

  it("run sub flow", async () => {
    const { code, events } = await runFlow("sub-twice");
    expect(code).toBe(0);

    const latestFinished = events.findLast(e => e.event === "BlockFinished");
    expect(latestFinished?.data.stacks?.[0].node_id).toBe("end");
  });
});
