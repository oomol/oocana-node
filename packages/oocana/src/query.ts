import { spawn } from "child_process";
import { join } from "path";
import { Cli } from "./cli";

export type UpstreamQueryParams = {
  flowPath: string;
  nodes: string[];
  searchPaths?: string;
  useCache?: boolean;
  oocanaBin?: string;
};

export type UpstreamResponse = {
  willRunNodes: string[];
  waitingNodes: string[];
  upstreamNodes: string[];
  flowPath: string;
};

export type ServiceQueryParams = {
  flowPath: string;
  searchPaths?: string;
};

export type ServiceQueryResponse = {
  dir: string;
  entry?: string;
  package?: string;
  service_hash: string;
  is_global: boolean;
};

export type PackageQueryParams = {
  flowPath: string;
  searchPaths?: string;
  oocanaBin?: string;
};

export type PackageQueryResponse = {
  [name: string]: boolean;
};

export async function queryPackage(
  params: PackageQueryParams
): Promise<PackageQueryResponse> {
  const bin = params.oocanaBin || join(__dirname, "..", "oocana");
  const args = [
    "query",
    "package",
    params.flowPath,
    "--search-paths",
    params.searchPaths || "",
  ];

  const spawnedProcess = await spawn(bin, args);

  const cli = new Cli(spawnedProcess);

  let packages: PackageQueryResponse = {};

  cli.addLogListener("stdout", data => {
    const lines = data.toString().trim().split("\n");
    for (const line of lines) {
      if (line.startsWith("package-status:")) {
        const pkg = line.replace("package-status: ", "").trim().split(":");
        if (pkg.length === 2) {
          packages[pkg[0]] = pkg[1] === "true";
        }
      }
    }
  });

  let err = "";
  cli.addLogListener("stderr", data => {
    err += data.toString();
  });

  await cli.wait();

  if (cli.result() !== 0) {
    throw new Error(`Failed to query packages for ${err}`);
  }

  return packages;
}

export async function queryService(params: ServiceQueryParams) {
  const bin = join(__dirname, "..", "oocana");
  const args = ["query", "service", params.flowPath];

  if (params.searchPaths) {
    args.push("--search-paths", params.searchPaths);
  }

  const spawnedProcess = await spawn(bin, args);

  const cli = new Cli(spawnedProcess);

  let services: ServiceQueryResponse[] = [];

  cli.addLogListener("stdout", data => {
    const lines = data.toString().trim().split("\n");
    for (const line of lines) {
      if (line.startsWith("service:")) {
        const svc = line.replace("service: ", "").trim();
        if (svc.length > 0) {
          try {
            const service = JSON.parse(svc);
            services.push(service);
          } catch (error) {
            console.error(`Failed to parse service: ${svc}`);
          }
        }
      }
    }
  });

  let err = "";
  cli.addLogListener("stderr", data => {
    err += data.toString();
  });

  await cli.wait();
  const exitCode = cli.result();

  if (exitCode !== 0) {
    throw new Error(`Failed to query services for ${err}`);
  }

  return services;
}

export async function queryUpstream(
  params: UpstreamQueryParams
): Promise<UpstreamResponse> {
  const bin = params.oocanaBin || join(__dirname, "..", "oocana");
  const args = [
    "query",
    "upstream",
    params.flowPath,
    "--nodes",
    params.nodes.join(","),
    "--search-paths",
    params.searchPaths || "",
  ];

  if (params.useCache) {
    args.push("--use-cache");
  }
  const spawnedProcess = await spawn(bin, args);

  const cli = new Cli(spawnedProcess);

  let willRunNodes: string[] = [];
  let waitingNodes: string[] = [];
  let upstreamNodes: string[] = [];

  cli.addLogListener("stdout", data => {
    const lines = data.toString().trim().split("\n");
    for (const line of lines) {
      if (line.startsWith("run:")) {
        willRunNodes = line
          .replace("run:", "")
          .split(",")
          .map(n => n.trim())
          .filter(n => n.length > 0);
      } else if (line.startsWith("waiting:")) {
        waitingNodes = line
          .replace("waiting:", "")
          .split(",")
          .map(n => n.trim())
          .filter(n => n.length > 0);
      } else if (line.startsWith("whole:")) {
        upstreamNodes = line
          .replace("whole:", "")
          .split(",")
          .map(n => n.trim())
          .filter(n => n.length > 0);
      }
    }
  });

  let error = "";
  cli.addLogListener("stderr", data => {
    error += data.toString();
  });

  await cli.wait();
  const exitCode = cli.result();

  if (exitCode !== 0) {
    throw new Error(`${error}`);
  }

  return {
    willRunNodes,
    waitingNodes,
    upstreamNodes,
    flowPath: params.flowPath,
  };
}
