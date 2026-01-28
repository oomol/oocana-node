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
    return this.#process.exitCode === null && !this.#process.killed;
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
}
