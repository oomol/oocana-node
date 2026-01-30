import {
  checkPackageLayer,
  createPackageLayer,
  deletePackageLayer,
  deleteAllPackageData,
  scanPackages,
  importPackageLayer,
  exportPackageLayer,
} from "@oomol/oocana";
import { isPackageLayerEnable } from "@oomol/oocana/src/layer";
import { readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path, { dirname, join } from "node:path";
import { describe, it, expect, vitest } from "vitest";
import { packages } from "./run";

const examplePackagePath = path.join(packages, "my-pkg");

vitest.setConfig({ maxConcurrency: 1 });
describe("Layer operations", () => {
  it("layer feature is enabled", async () => {
    let enable = await isPackageLayerEnable();
    expect(enable).toBe(true);
  });

  it(
    "delete-all",
    {
      timeout: 20 * 1000,
    },
    async () => {
      let cli = await deleteAllPackageData();

      cli.addLogListener("stdout", data => {
        console.log("stdout" + String(data));
      });

      cli.addLogListener("stderr", data => {
        console.log("stderr" + String(data));
      });

      let code = await cli.wait();
      expect(code).toBe(0);
    }
  );

  it(
    "normal operation: create, check, delete",
    {
      timeout: 20 * 1000,
    },
    async () => {
      {
        let cli = await deleteAllPackageData();

        cli.addLogListener("stdout", data => {
          console.log("stdout" + String(data));
        });

        cli.addLogListener("stderr", data => {
          console.log("stderr" + String(data));
        });

        let code = await cli.wait();
        expect(code).toBe(0);
      }

      const params = { packagePath: examplePackagePath };

      // make sure package layer not exist
      // then create a package layer
      // check the package is exist
      {
        let result = await checkPackageLayer(params);
        expect(result).toBe(false);

        let cli = await createPackageLayer({
          ...params,
          bindPaths: [{ src: "/tmp", dst: "/tmp/a" }],
        });

        cli.addLogListener("stdout", data => {
          console.log(data);
        });

        cli.addLogListener("stderr", data => {
          console.log(data);
        });

        let code = await cli.wait();
        expect(code).toBe(0);

        result = await checkPackageLayer(params);
        expect(result).toBe(true);
      }

      // delete the package layer and check the package is not exist
      {
        let cli = await deletePackageLayer(params);

        cli.addLogListener("stdout", data => {
          console.log(String(data));
        });

        cli.addLogListener("stderr", data => {
          console.log(String(data));
        });

        let code = await cli.wait();
        expect(code).toBe(0);

        let result = await checkPackageLayer(params);
        expect(result).toBe(false);
      }
    }
  );

  it(
    "export and import",
    {
      timeout: 20 * 1000,
    },
    async () => {
      const params = { packagePath: examplePackagePath };
      const exportPath = join(tmpdir(), "my-pkg");

      let result = await checkPackageLayer(params);
      expect(result).toBe(false);

      {
        let cli = await createPackageLayer(params);
        let code = await cli.wait();
        expect(code).toBe(0);
      }

      {
        let cli = await exportPackageLayer({
          packagePath: examplePackagePath,
          dest: exportPath,
        });
        cli.addLogListener("stdout", data => {
          console.log(String(data));
        });

        cli.addLogListener("stderr", data => {
          console.log(String(data));
        });
        let code = await cli.wait();
        expect(code).toBe(0);
      }

      {
        let cli = await deletePackageLayer(params);
        let code = await cli.wait();
        expect(code).toBe(0);
      }

      {
        let cli = await importPackageLayer({
          source: exportPath,
          packagePath: examplePackagePath,
        });

        cli.addLogListener("stdout", data => {
          console.log(String(data));
        });

        cli.addLogListener("stderr", data => {
          console.log(String(data));
        });
        let code = await cli.wait();
        expect(code).toBe(0);
      }

      {
        let result = await checkPackageLayer(params);
        expect(result).toBe(true);
      }
    }
  );

  it(
    "scan packages",
    {
      timeout: 30 * 1000,
    },
    async () => {
      let cli = await deleteAllPackageData();
      let code = await cli.wait();
      expect(code).toBe(0);

      let map = await scanPackages({
        searchPaths: [dirname(examplePackagePath)],
      });

      const package_number =
        (await readdir(dirname(examplePackagePath), {})).length - 1;

      let results = Object.values(map);
      expect(results, JSON.stringify(results)).not.toContain(true);
      expect(results.length, JSON.stringify(results)).toBe(package_number);
      expect(Object.keys(map)).toContain(examplePackagePath);

      {
        let cli = await createPackageLayer({ packagePath: examplePackagePath });
        cli.addLogListener("stdout", data => {
          console.log(String(data));
        });

        cli.addLogListener("stderr", data => {
          console.log(String(data));
        });
        let code = await cli.wait();
        expect(code).toBe(0);
      }

      map = await scanPackages({
        searchPaths: [dirname(examplePackagePath)],
      });
      console.log(map);
      for (const [key, value] of Object.entries(map)) {
        const files = await readdir(key, {});
        if (
          key.endsWith("my-pkg") &&
          (files.includes("package.oo.yaml") ||
            files.includes("package.oo.yml"))
        ) {
          expect(value).toBe("Exist");
        } else {
          expect(value).toBe("NotInStore");
        }
      }

      results = Object.values(map);
      expect(results).toContain("Exist");
      expect(results.length).toBe(package_number);
    }
  );
});
