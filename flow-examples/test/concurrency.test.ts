import { it, expect, describe } from "vitest";
import { runFlow } from "./run";

describe("concurrency test one", () => {
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
});

describe("concurrency test two", () => {
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

    const e = events.filter(
      e =>
        e.event === "BlockFinished" &&
        e.data.stacks.filter(e => e.node_id === "+javascript#2").length == 1
    );
    expect(e.length).toBe(1);

    expect(code).toBe(0);
  });
});
