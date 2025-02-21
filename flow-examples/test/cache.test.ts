import { describe, it, expect } from "vitest";
import { cleanCache } from "@oomol/oocana";

describe("cache test", () => {
  it("cache clean", async () => {
    const cli = await cleanCache({});

    cli.addLogListener("stderr", data => {
      console.error(data);
    });

    cli.addLogListener("stdout", data => {
      console.log(data);
    });

    let code = await cli.wait();
    expect(code).toBe(0);
  });
});
