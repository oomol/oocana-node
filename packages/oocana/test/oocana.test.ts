import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { spawnMock, reporterConnectMock } = vi.hoisted(() => ({
  spawnMock: vi.fn(),
  reporterConnectMock: vi.fn(),
}));

vi.mock("node:child_process", () => ({
  spawn: spawnMock,
}));

vi.mock("../src/reporter", () => ({
  Reporter: {
    connect: reporterConnectMock,
  },
}));

import { Oocana } from "../src/oocana";

interface MockChildProcess extends EventEmitter {
  kill: ReturnType<typeof vi.fn>;
  killed: boolean;
  signalCode: NodeJS.Signals | null;
  stdout: PassThrough;
  stderr: PassThrough;
}

function createChildProcessMock(): MockChildProcess {
  const process = new EventEmitter() as MockChildProcess;
  process.stdout = new PassThrough();
  process.stderr = new PassThrough();
  process.killed = false;
  process.signalCode = null;
  process.kill = vi.fn((signal: NodeJS.Signals = "SIGTERM") => {
    process.killed = true;
    process.signalCode = signal;
    process.emit("close", null, signal);
  });
  return process;
}

describe("Oocana", () => {
  beforeEach(() => {
    reporterConnectMock.mockResolvedValue({
      onMessage: vi.fn(),
      disconnect: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("passes connectorBaseUrl to runFlow cli args", async () => {
    const childProcess = createChildProcessMock();
    spawnMock.mockReturnValue(childProcess);

    const oocana = new Oocana("/tmp/oocana");
    await oocana.connect("127.0.0.1:47688");

    const cli = await oocana.runFlow({
      flowPath: "/tmp/test.oo.yaml",
      projectData: "/tmp/project-data",
      pkgDataRoot: "/tmp/pkg-data-root",
      connectorBaseUrl: "https://connector.example",
    });

    expect(spawnMock).toHaveBeenCalledWith(
      "/tmp/oocana",
      [
        "run",
        "/tmp/test.oo.yaml",
        "--reporter",
        "--broker",
        "127.0.0.1:47688",
        "--project-data",
        "/tmp/project-data",
        "--pkg-data-root",
        "/tmp/pkg-data-root",
        "--connector-base-url",
        "https://connector.example",
      ],
      expect.objectContaining({
        env: expect.any(Object),
      })
    );

    childProcess.emit("close", 0, null);
    await cli.wait();
  });

  it("passes connectorBaseUrl to runBlock cli args", async () => {
    const childProcess = createChildProcessMock();
    spawnMock.mockReturnValue(childProcess);

    const oocana = new Oocana("/tmp/oocana");
    await oocana.connect("127.0.0.1:47688");

    const cli = await oocana.runBlock({
      blockPath: "/tmp/block",
      projectData: "/tmp/project-data",
      pkgDataRoot: "/tmp/pkg-data-root",
      connectorBaseUrl: "https://connector.example",
    });

    expect(spawnMock).toHaveBeenCalledWith(
      "/tmp/oocana",
      [
        "run",
        "/tmp/block",
        "--reporter",
        "--broker",
        "127.0.0.1:47688",
        "--project-data",
        "/tmp/project-data",
        "--pkg-data-root",
        "/tmp/pkg-data-root",
        "--connector-base-url",
        "https://connector.example",
      ],
      expect.objectContaining({
        env: expect.any(Object),
      })
    );

    childProcess.emit("close", 0, null);
    await cli.wait();
  });
});
