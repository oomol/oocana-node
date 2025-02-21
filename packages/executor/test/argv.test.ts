import { it, expect } from "vitest";
import { getServiceArgs } from "../src/utils";

it("should return getArgv", () => {
  process.argv = [
    "node",
    "executor.js",
    "--address",
    "mqtt://localhost",
    "--service-hash",
    "service",
    "--session-dir",
    "/tmp/123",
  ];
  const argv = getServiceArgs();
  console.log(argv);
  expect(argv.address).toBe("mqtt://localhost");
  expect(argv.serviceHash).toBe("service");
});
