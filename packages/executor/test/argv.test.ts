import { it, expect } from "vitest";
import { getExecutorArgs, getServiceArgs } from "../src/utils";

it("executor args", () => {
  process.argv = [
    "node",
    "executor.js",
    "--inspect-wait=9230",
    "--address",
    "mqtt://localhost",
    "--session-dir",
    "/tmp/123",
    "--session-id",
    "se",
    "--tmp-dir",
    "/var/tmp",
  ];
  const argv = getExecutorArgs();
  console.log(argv);
  expect(argv.address).toBe("mqtt://localhost");
  expect(argv.inspectWait).toBe(9230);
});

it("service args", () => {
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
