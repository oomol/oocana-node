import type { MqttClient, OnMessageCallback } from "mqtt";
import mqtt from "mqtt";
import type { ReporterMessageKeys, ReporterMessage } from "@oomol/oocana-types";

export class Reporter {
  public static async connect(address: string): Promise<Reporter> {
    address = address.includes("://") ? address : `mqtt://${address}`;

    const client = mqtt.connect(address);
    await client.subscribeAsync("report/#");

    return new Reporter(client, address);
  }

  private constructor(
    private readonly mqtt: MqttClient,
    public readonly address: string
  ) {}

  public async disconnect(): Promise<void> {
    await this.mqtt.endAsync();
  }

  public onMessage(
    callback: (type: ReporterMessageKeys, message: ReporterMessage) => void
  ): () => void {
    const handler: OnMessageCallback = (_topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data && data.type) {
          callback(data.type, data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    this.mqtt.on("message", handler);

    return () => {
      this.mqtt.off("message", handler);
    };
  }
}
