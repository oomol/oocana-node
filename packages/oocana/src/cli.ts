import { IDisposable, disposableStore } from "@wopjs/disposable";
import { ChildProcess } from "child_process";

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

    this.#process.once("close", code => {
      this.#exitCode = code;
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
    return this.#process.exitCode;
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

    if (this.#process.killed) {
      return -1;
    }
    return new Promise(resolve => {
      this.#process.on("close", resolve);
    });
  };
}
