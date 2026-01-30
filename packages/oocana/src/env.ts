export type SpawnedEnvs = {
  [key: string]: string | undefined;
};

/**
 * Generates a set of environment variables to be used when spawning a new process.
 *
 * This function merges environment variables from several sources:
 * - The current process environment (`process.env`), optionally overridden by `defaultEnvs`.
 * - Any variables in `process.env` that start with "OOCANA_" or "OOMOL_".
 * - Additional environment variables provided in the `envs` parameter.
 * - OOMOL-specific environment variables provided in the `oomolEnvs` parameter, which are normalized to have the "OOMOL_" prefix and uppercase keys.
 *
 * The resulting environment object will always include the current `PATH` variable.
 *
 * @param envs - Additional environment variables to include or override.
 * @param oomolEnvs - OOMOL-specific environment variables to include, automatically prefixed and uppercased.
 * @param defaultEnvs - Optional base environment object to use instead of `process.env`.
 * @returns A merged object containing all relevant environment variables for spawning a process.
 */
export function generateSpawnEnvs(
  envs: Record<string, string> = {},
  oomolEnvs?: Record<string, string>,
  defaultEnvs?: SpawnedEnvs
): SpawnedEnvs {
  const baseEnvs = defaultEnvs || process.env;
  const spawnedEnvs: SpawnedEnvs = { ...baseEnvs };
  const path = baseEnvs.PATH || "";
  spawnedEnvs.PATH = path;

  // OOCANA_/OOMOL_ vars always come from process.env (runtime config)
  for (const key of Object.keys(process.env)) {
    if (
      (key.startsWith("OOCANA_") || key.startsWith("OOMOL_")) &&
      !!process.env[key]
    ) {
      spawnedEnvs[key] = process.env[key];
    }
  }

  for (const [key, value] of Object.entries(envs)) {
    spawnedEnvs[key] = value;
  }

  for (const [key, value] of Object.entries(oomolEnvs || {})) {
    let envKey = key.toUpperCase();
    if (!envKey.startsWith("OOMOL_")) {
      envKey = `OOMOL_${envKey}`;
    }
    spawnedEnvs[envKey] = value;
  }

  return spawnedEnvs;
}
