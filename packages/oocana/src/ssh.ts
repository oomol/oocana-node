import { ChildProcess, spawn, SpawnOptions } from "child_process";

export function sshSpawn(
  command: string,
  args: string[],
  options?: SpawnOptions
): ChildProcess {
  // TODO: 支持 zsh
  const shell = options?.shell || "bash";

  let oomol_envs = undefined;
  // FIXME: 待测试
  if (options?.env) {
    oomol_envs = Object.entries(options.env)
      .map(([key, value]) => {
        return `${key}=${value}`;
      })
      .join(" ");
  }
  const commands = `bash -c -i "${command} ${args.join(" ")}"`;

  // host 也需要主动设置
  // command 是一个路径，需要确保它是绝对路径。
  return spawn(
    "ssh",
    ["outside", oomol_envs ? `${oomol_envs} ${commands}` : commands],
    options || { stdio: "pipe" }
  );
}
