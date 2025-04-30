export function spawnedEnvs(
  envs: Record<string, string> = {},
  oomolEnvs?: Record<string, string>
): Record<string, string> {
  const spawnedEnvs: Record<string, string> = {};
  const path = process.env.PATH || "";
  spawnedEnvs.PATH = path;

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
