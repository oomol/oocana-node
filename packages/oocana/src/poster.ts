import type { MqttClient } from "mqtt";
import mqtt from "mqtt";
import { DEFAULT_PORT } from "./oocana";

export class Poster {
  public static connect(address = `127.0.0.1:${DEFAULT_PORT}`): Poster {
    address = address.includes("://") ? address : `mqtt://${address}`;

    const client = mqtt.connect(address);

    return new Poster(client, address);
  }

  private constructor(
    private readonly mqtt: MqttClient,
    public readonly address: string
  ) {}

  public async disconnect(): Promise<void> {
    await this.mqtt.endAsync();
  }

  public postToService({
    session_id,
    job_id,
    node_id,
    flow_path,
    payload,
  }: {
    session_id: string;
    job_id: string;
    node_id: string;
    flow_path: string;
    payload: any;
  }): void {
    this.mqtt.publish(
      `service/${session_id}`,
      JSON.stringify({ session_id, job_id, payload, node_id, flow_path })
    );
  }

  public sendSessionEnd({
    session_id,
    flow_path,
  }: {
    session_id: string;
    flow_path: string;
  }): void {
    // TODO: 使用 oocana-cli 终止
    // 伪造 report 让 executor 知道 session 结束。oocana cli 还是被动被杀掉的。
    this.mqtt.publish(
      `report`,
      JSON.stringify({
        session_id,
        path: flow_path,
        type: "SessionFinished",
        finish_at: new Date().getTime(),
      })
    );
  }
}
