import type { Context } from "@oomol/oocana-types";
import { AsyncLocalStorage } from "async_hooks";

export const asyncLocalStorage = new AsyncLocalStorage();

const originalStdoutWrite = process.stdout.write;
const originalStderrWrite = process.stderr.write;

hookStream(process.stdout, function (chunk) {
  const context = asyncLocalStorage.getStore() as Context | undefined;

  if (context) {
    // replace last \n to empty string
    context.reportLog(chunk.toString().replace(/\n$/, ""), "stdout");
  } else {
    originalStdoutWrite.call(process.stdout, chunk);
  }
  return true;
});

hookStream(process.stderr, function (chunk) {
  const context = asyncLocalStorage.getStore() as Context | undefined;
  if (context) {
    context.reportLog(chunk.toString().replace(/\n$/, ""), "stderr");
  } else {
    originalStderrWrite.call(process.stderr, chunk);
  }
  return true;
});

function hookStream(
  stream: NodeJS.WriteStream,
  fn: NodeJS.WriteStream["write"]
) {
  const oldWrite = stream.write;
  stream.write = fn;
  return () => {
    stream.write = oldWrite;
  };
}
