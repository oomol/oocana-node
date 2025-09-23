import { Mainframe } from "./mainframe";
import { JobInfo } from "@oomol/oocana-types";
import { randomUUID } from "node:crypto";

export class InternalAPI {
  private client: Mainframe;
  private jobId: JobInfo;

  constructor(client: Mainframe, jobId: JobInfo) {
    this.client = client;
    this.jobId = jobId;
  }

  /**
   * Update the weight of a node.
   * @param nodeId The ID of the node to update.
   * @param weight The new weight for the node. Must be a non-negative finite number.
   */
  async updateNodeWeight(nodeId: string, weight: number | bigint): Promise<void> {
    if (typeof weight !== "number" && typeof weight !== "bigint") {
      throw new Error("Weight must be a number or bigint.");
    }

    const numericWeight = Number(weight);
    if (!Number.isFinite(numericWeight) || numericWeight < 0) {
      throw new Error("Weight must be a non-negative finite number.");
    }

    await this.client.sendRequest({
      type: "BlockRequest",
      action: "UpdateNodeWeight",
      session_id: this.jobId.session_id,
      job_id: this.jobId.job_id,
      node_id: nodeId,
      weight: numericWeight,
      request_id: randomUUID(),
    });
  }
}