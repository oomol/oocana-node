import { IDisposable, disposableStore } from "@wopjs/disposable";
import { ChildProcess } from "child_process";
import { constants } from "os";

// Convert signal name to exit code (128 + signal number, Unix convention)
function signalToExitCode(signal: NodeJS.Signals | null): number {
  if (!signal) {
    return -1;
  }
  const signalNum = constants.signals[signal];
  return signalNum ? 128 + signalNum : -1;
}

export class Cli implements IDisposable {
  public readonly dispose = disposableStore();
  #process: ChildProcess;
  #exitCode: number | null = null;

  constructor(public readonly process: ChildProcess) {
    this.#process = process;
    this.#process.stderr?.setEncoding("utf-8");
    this.#process.stdout?.setEncoding("utf-8");
    this.#process.on("close", this.kill);
    this.dispose.add(this.kill);

    this.#process.once("close", (code, signal) => {
      this.#exitCode = code ?? signalToExitCode(signal);
    });
  }

  public kill = (): void => {
    if (!this.#process.killed) {
      this.#process.kill();
    }
  };

  public isRunning = (): boolean => {
    return this.#exitCode === null;
  };

  public result = (): number | null => {
    if (this.#exitCode !== null) {
      return this.#exitCode;
    }
    if (this.#process.killed) {
      return signalToExitCode(this.#process.signalCode);
    }
    return null;
  };

  public addLogListener = (
    stdio: "stdout" | "stderr",
    listener: (data: string) => void
  ): void => {
    this.#process[stdio]?.on("data", listener);
  };

  public wait = async (): Promise<number> => {
    if (this.#exitCode !== null) {
      return this.#exitCode;
    }

    return new Promise(resolve => {
      this.#process.on("close", (code, signal) => {
        resolve(code ?? signalToExitCode(signal));
      });
    });
  };

  /**
   * Wait for process to complete while collecting stderr.
   * Useful for commands that write results to files.
   */
  public waitWithStderr = async (): Promise<{
    exitCode: number;
    stderr: string;
  }> => {
    let stderr = "";
    this.addLogListener("stderr", data => {
      stderr += data;
    });
    const exitCode = await this.wait();
    return { exitCode, stderr };
  };

  /**
   * Parse stdout stream until parser returns a non-null result.
   * Resolves immediately when parser finds a result.
   * Rejects if process exits without parser finding a result.
   */
  public runAndParse = <T>(parser: (stdout: string) => T | null): Promise<T> => {
    return new Promise((resolve, reject) => {
      let result: T | null = null;
      let stderr = "";

      this.addLogListener("stdout", data => {
        if (result !== null) return;

        const parsed = parser(data);
        if (parsed !== null) {
          result = parsed;
          resolve(parsed);
        }
      });

      this.addLogListener("stderr", data => {
        stderr += data;
      });

      this.wait().then(exitCode => {
        if (result === null) {
          const errorMsg =
            stderr || `Process exited with code ${exitCode} without result`;
          reject(new Error(errorMsg));
        }
      });
    });
  };
}
