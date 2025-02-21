export interface BlockJobStackLevel {
  flow_job_id: string;
  flow: string;
  node_id: string;
}

export interface JobInfo {
  session_id: string;
  job_id: string;
}

export interface BlockInfo extends JobInfo {
  block_path?: string;
  stacks: readonly BlockJobStackLevel[];
}
