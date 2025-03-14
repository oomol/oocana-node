import { it, expect } from "vitest";
import { getExecutorArgs, getServiceArgs } from "../src/utils";

it("executor getArgv", () => {
  process.argv = [
    "node",
    "executor.js",
    "--session-id",
    "123",
    "--session-dir",
    "/tmp/123",
    "--env-files",
    "1.json",
    "--env-files",
    "2.json",
  ];
  const argv = getExecutorArgs();
  console.log(argv);
  expect(argv.sessionId).toBe("123");
  expect(argv.sessionDir).toBe("/tmp/123");
  expect(argv.envFiles).toEqual(["1.json", "2.json"]);
});

it("service getArgv", () => {
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
