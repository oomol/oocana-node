import { describe, it, expect, beforeAll } from "vitest";
import path from "node:path";
import { readdir } from "node:fs/promises";
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

    it(
      "run pkg flow",
      async () => {
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
      },
      {
        repeats: 5,
      }
    );
  }
);
