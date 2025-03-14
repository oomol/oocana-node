import { writeFile, stat, mkdir, unlink, rmdir } from "fs/promises";
import { dirname, join } from "node:path";
import { logger } from "./logger";
import { readFile } from "node:fs/promises";

export async function loadEnvFile(file: string): Promise<any> {
  if (file.endsWith(".json")) {
    const content = await readFile(file, "utf-8");
    try {
      return JSON.parse(content);
    } catch (error) {
      return {};
    }
  }
  // TODO: add warning logger
  return {};
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

const TEMP_DIR = ".scriptlets";

const templateFiles = new Set<string>();

export async function createModuleFile({
  dir,
  filename,
  source,
}: {
  dir: string;
  filename: string;
  source: string;
}): Promise<string> {
  const filePath = join(dir, TEMP_DIR, `${filename}.ts`);

  const dirs = dirname(filePath);
  if (!(await isDirectory(dirs))) {
    await mkdir(dirs, { recursive: true });
  }

  await writeFile(filePath, source);
  logger.info("write tmpFile ", filePath);
  templateFiles.add(filePath);
  return filePath;
}

export async function clearTmpFiles() {
  logger.info("clearTmpFiles start");
  const set = new Set<string>();
  for (const file of templateFiles) {
    await unlink(file)
      .then(() => {
        logger.info(`unlink ${file} success`);
      })
      .catch(() => {
        logger.error(`unlink ${file} failed`);
      });
    set.add(dirname(file));
  }

  templateFiles.clear();
  for (const dir of set) {
    // 只删除 .scriptlets 目录下的子目录
    logger.info(`dir: ${dir} dirname: ${dirname(dir)}`);
    if (dirname(dir).endsWith(TEMP_DIR)) {
      await rmdir(dir).catch(() => {
        logger.error(`rmdir ${dir} failed`);
      });
    }
  }
  logger.info("clearTmpFiles end");
}
