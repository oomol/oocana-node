import { it, expect } from "vitest";
import { runFlow } from "./run";
import { describe } from "node:test";

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
    ).eq(4);

    expect(code).toBe(0);
  });
});
