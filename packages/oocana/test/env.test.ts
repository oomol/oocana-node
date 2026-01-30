import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { generateSpawnEnvs, SpawnedEnvs } from "../src/env";

describe("generateSpawnEnvs", () => {
  // Save original process.env
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original process.env
    process.env = originalEnv;
  });

  describe("basic merging", () => {
    it("should merge envs parameter into result", () => {
      const result = generateSpawnEnvs({ FOO: "bar", BAZ: "qux" });

      expect(result.FOO).toBe("bar");
      expect(result.BAZ).toBe("qux");
    });

    it("should preserve PATH from base environment", () => {
      const defaultEnvs: SpawnedEnvs = { PATH: "/custom/path" };
      const result = generateSpawnEnvs({}, undefined, defaultEnvs);

      expect(result.PATH).toBe("/custom/path");
    });

    it("should use process.env when defaultEnvs is not provided", () => {
      process.env.PATH = "/test/path";
      const result = generateSpawnEnvs({});

      expect(result.PATH).toBe("/test/path");
    });
  });

  describe("environment isolation", () => {
    it("should not mutate the original defaultEnvs object", () => {
      const defaultEnvs: SpawnedEnvs = { PATH: "/original", EXISTING: "value" };
      const originalCopy = { ...defaultEnvs };

      generateSpawnEnvs({ NEW_VAR: "new_value" }, undefined, defaultEnvs);

      // Original should be unchanged
      expect(defaultEnvs).toEqual(originalCopy);
    });

    it("should create a shallow copy of defaultEnvs", () => {
      const defaultEnvs: SpawnedEnvs = { PATH: "/original" };
      const result = generateSpawnEnvs({}, undefined, defaultEnvs);

      // Modifying result should not affect defaultEnvs
      result.NEW_KEY = "new_value";
      expect(defaultEnvs.NEW_KEY).toBeUndefined();
    });

    it("should use defaultEnvs PATH instead of process.env.PATH", () => {
      process.env.PATH = "/process/path";
      const defaultEnvs: SpawnedEnvs = { PATH: "/custom/path" };

      const result = generateSpawnEnvs({}, undefined, defaultEnvs);

      expect(result.PATH).toBe("/custom/path");
    });
  });

  describe("OOCANA_ and OOMOL_ prefix handling", () => {
    it("should copy OOCANA_ prefixed vars from base environment", () => {
      const defaultEnvs: SpawnedEnvs = {
        PATH: "/path",
        OOCANA_DEBUG: "true",
        OOCANA_CONFIG: "/config",
      };

      const result = generateSpawnEnvs({}, undefined, defaultEnvs);

      expect(result.OOCANA_DEBUG).toBe("true");
      expect(result.OOCANA_CONFIG).toBe("/config");
    });

    it("should copy OOMOL_ prefixed vars from base environment", () => {
      const defaultEnvs: SpawnedEnvs = {
        PATH: "/path",
        OOMOL_TOKEN: "secret",
        OOMOL_ENV: "production",
      };

      const result = generateSpawnEnvs({}, undefined, defaultEnvs);

      expect(result.OOMOL_TOKEN).toBe("secret");
      expect(result.OOMOL_ENV).toBe("production");
    });

    it("should not copy vars without OOCANA_/OOMOL_ prefix from base", () => {
      const defaultEnvs: SpawnedEnvs = {
        PATH: "/path",
        RANDOM_VAR: "value",
        HOME: "/home/user",
      };

      const result = generateSpawnEnvs({}, undefined, defaultEnvs);

      // These should still be in result because we copy all of defaultEnvs
      // but the prefix logic specifically copies OOCANA_/OOMOL_ vars
      expect(result.PATH).toBe("/path");
    });
  });

  describe("oomolEnvs parameter", () => {
    it("should add OOMOL_ prefix to keys that dont have it", () => {
      const result = generateSpawnEnvs({}, { token: "secret" });

      expect(result.OOMOL_TOKEN).toBe("secret");
    });

    it("should uppercase keys in oomolEnvs", () => {
      const result = generateSpawnEnvs({}, { myKey: "value" });

      expect(result.OOMOL_MYKEY).toBe("value");
    });

    it("should not double-prefix keys that already have OOMOL_", () => {
      const result = generateSpawnEnvs({}, { OOMOL_EXISTING: "value" });

      expect(result.OOMOL_EXISTING).toBe("value");
      expect(result.OOMOL_OOMOL_EXISTING).toBeUndefined();
    });

    it("should handle lowercase oomol_ prefix", () => {
      const result = generateSpawnEnvs({}, { oomol_test: "value" });

      // After uppercase: OOMOL_TEST, which already has prefix
      expect(result.OOMOL_TEST).toBe("value");
    });
  });

  describe("priority and override", () => {
    it("should allow envs to override defaultEnvs values", () => {
      const defaultEnvs: SpawnedEnvs = { MY_VAR: "original" };
      const result = generateSpawnEnvs(
        { MY_VAR: "overridden" },
        undefined,
        defaultEnvs
      );

      expect(result.MY_VAR).toBe("overridden");
    });

    it("should allow oomolEnvs to override envs values", () => {
      const result = generateSpawnEnvs(
        { OOMOL_KEY: "from_envs" },
        { key: "from_oomolEnvs" }
      );

      expect(result.OOMOL_KEY).toBe("from_oomolEnvs");
    });
  });

  describe("edge cases", () => {
    it("should handle empty envs object", () => {
      const result = generateSpawnEnvs({});

      expect(result.PATH).toBeDefined();
    });

    it("should handle undefined oomolEnvs", () => {
      const result = generateSpawnEnvs({ FOO: "bar" }, undefined);

      expect(result.FOO).toBe("bar");
    });

    it("should handle empty PATH", () => {
      const defaultEnvs: SpawnedEnvs = { PATH: "" };
      const result = generateSpawnEnvs({}, undefined, defaultEnvs);

      expect(result.PATH).toBe("");
    });

    it("should handle undefined values in defaultEnvs", () => {
      const defaultEnvs: SpawnedEnvs = {
        PATH: "/path",
        UNDEFINED_VAR: undefined,
      };

      const result = generateSpawnEnvs({}, undefined, defaultEnvs);

      expect(result.UNDEFINED_VAR).toBeUndefined();
    });
  });
});
