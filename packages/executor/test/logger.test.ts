import { describe, it } from "vitest";
import log from "../src/logger";

describe("logger console api", () => {
  it("should log to console", () => {
    const a = {
      key: "value",
    };

    log.info("Hello world!", a);
    // 后面只接受 key-value 形式的参数，如果直接传入，会被忽略。行为与传统 console 不一致。
    log.info("simple message");

    log.warn("Hello world!");
    log.warning("Hello world!");

    console.log("Hello world!", a);
    console.log("info", "Hello world!", a);
  });

  it("error log", () => {
    log.error("error message", new Error("error")); // 能够正常输出 Error 的具体信息
    log.error(new Error("another error")); // 输出的是 error: undefined
    log.error(`error message`); // 输出的是 error: error message
  });
});
