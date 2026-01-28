import { describe, it, expect } from "vitest";
import { spawn } from "child_process";
import { constants } from "os";
import { Cli } from "../src/cli";

// Signal numbers from os.constants.signals
const SIGTERM = 128 + constants.signals.SIGTERM; // 128 + 15 = 143
const SIGKILL = 128 + constants.signals.SIGKILL; // 128 + 9 = 137
const SIGSEGV = 128 + constants.signals.SIGSEGV; // 128 + 11 = 139

describe("Cli", () => {
  describe("exit code handling", () => {
    it("should return exit code when process exits with error", async () => {
      const process = spawn("node", ["-e", "process.exit(1)"]);
      const cli = new Cli(process);

      const exitCode = await cli.wait();
      expect(exitCode).toBe(1);
      expect(cli.result()).toBe(1);
    });

    it("should return exit code when process exits normally", async () => {
      const process = spawn("node", ["-e", "process.exit(0)"]);
      const cli = new Cli(process);

      const exitCode = await cli.wait();
      expect(exitCode).toBe(0);
      expect(cli.result()).toBe(0);
    });

    it("should return non-zero exit code for uncaught exception", async () => {
      const process = spawn("node", ["-e", "throw new Error('test error')"]);
      const cli = new Cli(process);

      const exitCode = await cli.wait();
      expect(exitCode).toBe(1);
      expect(cli.result()).toBe(1);
    });
  });

  describe("isRunning", () => {
    it("should return true while process is running", async () => {
      const process = spawn("node", ["-e", "setTimeout(() => {}, 1000)"]);
      const cli = new Cli(process);

      expect(cli.isRunning()).toBe(true);

      cli.kill();
      await cli.wait();
    });

    it("should return false after process exits", async () => {
      const process = spawn("node", ["-e", "process.exit(0)"]);
      const cli = new Cli(process);

      await cli.wait();

      expect(cli.isRunning()).toBe(false);
    });

    it("should return false after process terminates via self-signal", async () => {
      // 进程给自己发信号终止，不经过 ChildProcess.kill()
      const process = spawn("node", [
        "-e",
        "process.kill(process.pid, 'SIGTERM')",
      ]);
      const cli = new Cli(process);

      await cli.wait();

      expect(cli.isRunning()).toBe(false);
    });
  });

  describe("killed process", () => {
    it("result() should be consistent with wait() for killed process", async () => {
      const process = spawn("node", ["-e", "setTimeout(() => {}, 10000)"]);
      const cli = new Cli(process);

      cli.kill();
      const exitCode = await cli.wait();

      expect(cli.result()).toBe(exitCode);
      expect(exitCode).toBe(SIGTERM);
    });

    it("should return 128+SIGTERM when process is killed by SIGTERM", async () => {
      const process = spawn("node", ["-e", "setTimeout(() => {}, 10000)"]);
      const cli = new Cli(process);

      process.kill("SIGTERM");
      const exitCode = await cli.wait();

      expect(exitCode).toBe(SIGTERM);
      expect(cli.result()).toBe(SIGTERM);
    });
  });

  describe("consistency checks", () => {
    it("result() should equal wait() return value after process ends", async () => {
      const process = spawn("node", ["-e", "process.exit(42)"]);
      const cli = new Cli(process);

      const waitResult = await cli.wait();
      const resultValue = cli.result();

      expect(resultValue).toBe(waitResult);
    });
  });

  describe("crash scenarios", () => {
    it("wait() should return exit code when process crashes with stack overflow", async () => {
      const process = spawn("node", [
        "-e",
        "function overflow() { overflow(); } overflow();",
      ]);
      const cli = new Cli(process);

      const exitCode = await cli.wait();

      expect(exitCode).not.toBeNull();
      expect(typeof exitCode).toBe("number");
    });

    it("should return 128+SIGKILL when process is killed by SIGKILL", async () => {
      const process = spawn("node", ["-e", "setTimeout(() => {}, 10000)"]);
      const cli = new Cli(process);

      process.kill("SIGKILL");
      const exitCode = await cli.wait();

      expect(exitCode).toBe(SIGKILL);
      expect(cli.result()).toBe(SIGKILL);
    });

    it("should return 128+SIGSEGV when process crashes with SIGSEGV", async () => {
      const process = spawn("node", [
        "-e",
        "process.kill(process.pid, 'SIGSEGV')",
      ]);
      const cli = new Cli(process);

      const exitCode = await cli.wait();

      expect(exitCode).toBe(SIGSEGV);
      expect(cli.result()).toBe(SIGSEGV);
    });
  });
});
