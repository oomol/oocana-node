import { isPackageLayerEnable } from "@oomol/oocana";
import { describe, expect, it } from "vitest";

describe("Layer operations", () => {
  it("layer feature is disable", async () => {
    let enable = await isPackageLayerEnable();
    expect(enable).toBe(false);
  });
});