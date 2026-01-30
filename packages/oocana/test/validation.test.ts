import { describe, it, expect } from "vitest";
import {
  BIND_PATH_PATTERN,
  validateBindPath,
  validateBindPaths,
} from "../src/validation";

describe("BIND_PATH_PATTERN", () => {
  describe("valid patterns", () => {
    it("should match minimal format: src=X,dst=Y", () => {
      expect(BIND_PATH_PATTERN.test("src=/source,dst=/dest")).toBe(true);
    });

    it("should match with ro option", () => {
      expect(BIND_PATH_PATTERN.test("src=/source,dst=/dest,ro")).toBe(true);
    });

    it("should match with rw option", () => {
      expect(BIND_PATH_PATTERN.test("src=/source,dst=/dest,rw")).toBe(true);
    });

    it("should match with recursive option", () => {
      expect(BIND_PATH_PATTERN.test("src=/source,dst=/dest,recursive")).toBe(
        true
      );
    });

    it("should match with nonrecursive option", () => {
      expect(BIND_PATH_PATTERN.test("src=/source,dst=/dest,nonrecursive")).toBe(
        true
      );
    });

    it("should match with both ro and recursive options", () => {
      expect(
        BIND_PATH_PATTERN.test("src=/source,dst=/dest,ro,recursive")
      ).toBe(true);
    });

    it("should match with both rw and nonrecursive options", () => {
      expect(
        BIND_PATH_PATTERN.test("src=/source,dst=/dest,rw,nonrecursive")
      ).toBe(true);
    });

    it("should match paths with spaces (edge case)", () => {
      expect(
        BIND_PATH_PATTERN.test("src=/path with spaces,dst=/another path")
      ).toBe(true);
    });

    it("should match Windows-style paths", () => {
      expect(BIND_PATH_PATTERN.test("src=C:\\Users\\test,dst=D:\\data")).toBe(
        true
      );
    });

    it("should match relative paths", () => {
      expect(BIND_PATH_PATTERN.test("src=./local,dst=../parent")).toBe(true);
    });
  });

  describe("invalid patterns", () => {
    it("should not match empty string", () => {
      expect(BIND_PATH_PATTERN.test("")).toBe(false);
    });

    it("should not match missing src=", () => {
      expect(BIND_PATH_PATTERN.test("/source,dst=/dest")).toBe(false);
    });

    it("should not match missing dst=", () => {
      expect(BIND_PATH_PATTERN.test("src=/source,/dest")).toBe(false);
    });

    it("should not match wrong order (dst before src)", () => {
      expect(BIND_PATH_PATTERN.test("dst=/dest,src=/source")).toBe(false);
    });

    it("should not match invalid read/write option", () => {
      expect(BIND_PATH_PATTERN.test("src=/source,dst=/dest,readonly")).toBe(
        false
      );
    });

    it("should not match invalid recursive option", () => {
      expect(BIND_PATH_PATTERN.test("src=/source,dst=/dest,recurse")).toBe(
        false
      );
    });

    it("should not match options in wrong order", () => {
      expect(
        BIND_PATH_PATTERN.test("src=/source,dst=/dest,recursive,ro")
      ).toBe(false);
    });

    it("should not match missing source path", () => {
      expect(BIND_PATH_PATTERN.test("src=,dst=/dest")).toBe(false);
    });

    it("should not match missing dest path", () => {
      expect(BIND_PATH_PATTERN.test("src=/source,dst=")).toBe(false);
    });

    it("should not match extra commas", () => {
      expect(BIND_PATH_PATTERN.test("src=/source,,dst=/dest")).toBe(false);
    });
  });
});

describe("validateBindPath", () => {
  it("should not throw for valid bind path", () => {
    expect(() => validateBindPath("src=/source,dst=/dest")).not.toThrow();
  });

  it("should not throw for valid bind path with options", () => {
    expect(() =>
      validateBindPath("src=/source,dst=/dest,ro,recursive")
    ).not.toThrow();
  });

  it("should throw Error for invalid bind path", () => {
    expect(() => validateBindPath("invalid")).toThrow(Error);
  });

  it("should throw Error with descriptive message", () => {
    expect(() => validateBindPath("bad/path")).toThrow(
      /Invalid bind path format/
    );
  });

  it("should include the invalid path in error message", () => {
    const invalidPath = "this-is-invalid";
    expect(() => validateBindPath(invalidPath)).toThrow(invalidPath);
  });

  it("should include expected format in error message", () => {
    expect(() => validateBindPath("bad")).toThrow(
      /src=<source>,dst=<destination>/
    );
  });
});

describe("validateBindPaths", () => {
  it("should not throw for empty array", () => {
    expect(() => validateBindPaths([])).not.toThrow();
  });

  it("should not throw for array of valid paths", () => {
    expect(() =>
      validateBindPaths([
        "src=/a,dst=/b",
        "src=/c,dst=/d,ro",
        "src=/e,dst=/f,rw,recursive",
      ])
    ).not.toThrow();
  });

  it("should throw for array with one invalid path", () => {
    expect(() =>
      validateBindPaths(["src=/a,dst=/b", "invalid", "src=/c,dst=/d"])
    ).toThrow(Error);
  });

  it("should throw on first invalid path", () => {
    expect(() => validateBindPaths(["bad1", "bad2"])).toThrow("bad1");
  });

  it("should validate single element array", () => {
    expect(() => validateBindPaths(["src=/source,dst=/dest"])).not.toThrow();
    expect(() => validateBindPaths(["invalid"])).toThrow();
  });
});
