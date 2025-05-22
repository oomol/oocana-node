import { exec } from "child_process";
import { existsSync } from "node:fs";
import { dirname } from "node:path";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import os from "os";

(async function () {
  const layer = `${os.homedir()}/.oomol-studio/oocana/layer.json`;
  if (existsSync(layer)) {
    const data = JSON.parse(await readFile(layer, "utf8"));
    console.log(`Layer data: ${JSON.stringify(data)}`);
    const rootfs = data["base_rootfs"];
    if (rootfs) {
      if (rootfs && rootfs.includes("executor")) {
        return;
      }
    }
    await createExecutor();
    rootfs.push("executor");
    console.log(`Updated layer data: ${JSON.stringify(data)}`);
    await writeFile(layer, JSON.stringify(data));
    return;
  }

  console.log("Layer not found");
  await createExecutor();
  await mkdir(dirname(layer), { recursive: true });
  writeFile(layer, JSON.stringify({ base_rootfs: ["executor"] }));
})();

async function createExecutor() {
  return new Promise((resolve, reject) => {
    exec("./executor.sh", (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(error);
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      resolve();
    });
  });
}
