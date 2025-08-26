import type {
  MqttClient,
  MqttClientEventCallbacks,
  OnMessageCallback,
} from "mqtt";
import mqtt from "mqtt";
import type {
  IMainframeBlockError,
  IMainframeBlockFinished,
  IMainframeBlockInputs,
  IMainframeBlockOutput,
  IMainframeBlockReady,
  IMainframeClientMessage,
  IReporterClientMessage,
  IMainframeExecutorReady,
  IReporterBlockWarning,
  IMainframeBlockOutputs,
  IMainframeRunBlockRequest,
  IMainframeQueryBlockRequest,
  ReporterMessage,
  IMainframeQueryDownstreamRequest,
  IMainframeBlockProgress,
  IMainframePreviewRequest,
} from "@oomol/oocana-types";

export class Mainframe {
  private mqtt: MqttClient;

  private hashMap: Map<string, OnMessageCallback> = new Map();
  private reporterCallbacks: Set<(payload: ReporterMessage) => void> =
    new Set();
  private sessionCallbacks: Map<
    string,
    Set<(payload: IMainframeClientMessage) => void>
  > = new Map();
  private requestResponseCallbacks: Map<string, Set<(payload: any) => void>> =
    new Map();

  public connectingPromise: Promise<void>;

  public constructor(address: string, clientId?: string) {
    const mqttAddress = address.includes("://") ? address : `mqtt://${address}`;
    this.mqtt = mqtt.connect(mqttAddress, {
      clientId:
        clientId ??
        `nodejs-executor-${Math.random().toString(36).slice(2, 10)}`,
    });

    this.connectingPromise = new Promise<void>((resolve, reject) => {
      const client = this.mqtt;
      const promiseResolutionListeners: Partial<MqttClientEventCallbacks> = {
        connect: () => {
          removePromiseResolutionListeners();
          resolve(); // Resolve on connect
        },
        end: () => {
          removePromiseResolutionListeners();
          resolve(); // Resolve on end
        },
        error: err => {
          removePromiseResolutionListeners();
          client.end();
          reject(err); // Reject on error
        },
      };

      // Remove listeners added to client by this promise
      function removePromiseResolutionListeners() {
        Object.keys(promiseResolutionListeners).forEach(eventName => {
          const key = eventName as keyof typeof promiseResolutionListeners;
          const listener = promiseResolutionListeners[key];
          if (listener) {
            client.off(key, listener);
          }
        });
      }

      // Add listeners to client
      Object.keys(promiseResolutionListeners).forEach(eventName => {
        const key = eventName as keyof typeof promiseResolutionListeners;
        const listener = promiseResolutionListeners[key];
        if (listener) {
          client.on(key, listener);
        }
      });
    });

    this.mqtt.on("message", (topic, payload, packet) => {
      const callback = this.hashMap.get(topic);
      if (callback) {
        callback(topic, payload, packet);
      }
      if (topic === "report") {
        for (const cb of this.reporterCallbacks) {
          try {
            const message = JSON.parse(payload.toString()) as ReporterMessage;
            cb(message);
          } catch (error) {
            console.error("Error parsing report message:", error);
          }
        }
      }
    });
  }

  public async waitingClose(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.mqtt.on("close", () => {
        resolve();
      });

      this.mqtt.on("error", error => {
        reject(error);
      });
    });
  }

  public addSessionCallback(
    sessionId: string,
    callback: (payload: IMainframeClientMessage) => void
  ): void {
    const topic = `session/${sessionId}`;
    if (!this.sessionCallbacks.has(sessionId)) {
      this.sessionCallbacks.set(sessionId, new Set());
      this.subscribe(topic, (payload: IMainframeClientMessage) => {
        const callbacks = this.sessionCallbacks.get(sessionId);
        if (callbacks) {
          for (const cb of callbacks) {
            try {
              cb(payload);
            } catch (error) {
              console.error("Error in session callback:", error);
            }
          }
        }
      });
    }
    this.sessionCallbacks.get(sessionId)?.add(callback);
  }

  public removeSessionCallback(
    sessionId: string,
    callback: (payload: IMainframeClientMessage) => void
  ): void {
    const topic = `session/${sessionId}`;
    this.sessionCallbacks.get(sessionId)?.delete(callback);
    if (this.sessionCallbacks.get(sessionId)?.size === 0) {
      this.sessionCallbacks.delete(sessionId);
      this.unsubscribe(topic);
    }
  }

  public addRequestResponseCallback(
    sessionId: string,
    requestId: string,
    callback: (payload: any) => void
  ): void {
    if (!this.requestResponseCallbacks.has(requestId)) {
      this.requestResponseCallbacks.set(requestId, new Set());
      this.subscribe(
        `session/${sessionId}/request/${requestId}/response`,
        (payload: any) => {
          const callbacks = this.requestResponseCallbacks.get(requestId);
          if (callbacks) {
            for (const cb of callbacks) {
              try {
                cb(payload);
              } catch (error) {
                console.error("Error in run block callback:", error);
              }
            }
          }
        }
      );
    }
    this.requestResponseCallbacks.get(requestId)?.add(callback);
  }

  public removeRequestResponseCallback(
    sessionId: string,
    requestId: string,
    callback: (payload: any) => void
  ): void {
    this.requestResponseCallbacks.get(requestId)?.delete(callback);
    if (this.requestResponseCallbacks.get(requestId)?.size === 0) {
      this.requestResponseCallbacks.delete(requestId);
      this.unsubscribe(`session/${sessionId}/request/${requestId}/response`);
    }
  }

  public addReportCallback(callback: (payload: ReporterMessage) => any): void {
    this.reporterCallbacks.add(callback);
  }

  public removeReportCallback(
    callback: (payload: ReporterMessage) => any
  ): void {
    this.reporterCallbacks.delete(callback);
  }

  /** 暂时只支持写完整的 topic，不支持使用通配符 */
  public subscribe(topic: string, callback: (payload: any) => any): void {
    const fn: OnMessageCallback = (_topic, payload) => {
      const outputRef = JSON.parse(payload.toString());
      callback(outputRef);
    };
    this.subscribeCallback(topic, fn);
  }

  public unsubscribe(topic: string): void {
    this.removeMessageCallback(topic);
  }

  private subscribeCallback(topic: string, callback: OnMessageCallback): void {
    this.registerMessageCallback(topic, callback);
    this.mqtt.subscribe(topic, { qos: 1 });
  }

  private async send(message: IMainframeClientMessage): Promise<void> {
    await this.mqtt.publishAsync(
      `session/${message.session_id}`,
      JSON.stringify(message),
      { qos: 1 }
    );
  }

  private registerMessageCallback(topic: string, callback: OnMessageCallback) {
    this.hashMap.set(topic, callback);
  }

  private removeMessageCallback(topic: string) {
    this.hashMap.delete(topic);
  }

  public async sendOutput(message: IMainframeBlockOutput): Promise<void> {
    await this.send(message);
  }

  public async sendOutputs(message: IMainframeBlockOutputs): Promise<void> {
    await this.send(message);
  }

  public async sendFinish(message: IMainframeBlockFinished): Promise<void> {
    await this.send(message);
  }

  public async sendError(message: IMainframeBlockError): Promise<void> {
    await this.send(message);
  }

  public async sendRequest(
    message:
      | IMainframeRunBlockRequest
      | IMainframeQueryBlockRequest
      | IMainframeQueryDownstreamRequest
      | IMainframePreviewRequest
  ): Promise<void> {
    await this.send(message);
  }

  public async sendRun(message: IMainframeRunBlockRequest): Promise<void> {
    await this.send(message);
  }

  public async sendExecutorReady(
    message: IMainframeExecutorReady
  ): Promise<void> {
    await this.send(message);
  }

  public async sendReport(message: IReporterClientMessage): Promise<void> {
    await this.mqtt.publishAsync(`report`, JSON.stringify(message), {
      qos: 1,
    });
  }

  public async sendProgress(message: IMainframeBlockProgress): Promise<void> {
    await this.send(message);
  }

  public async sendWarning(message: IReporterBlockWarning): Promise<void> {
    await this.mqtt.publishAsync(`report`, JSON.stringify(message), {
      qos: 1,
    });
  }

  public async sendReady(
    message: IMainframeBlockReady
  ): Promise<IMainframeBlockInputs> {
    const inputsTopic = `inputs/${message.session_id}/${message.job_id}`;
    await this.mqtt.subscribeAsync(inputsTopic, { qos: 1 });

    const waitInputPromise = new Promise<string>(resolve => {
      const callback = (topic: string, payload: Buffer) => {
        this.removeMessageCallback(topic);
        resolve(payload.toString());
        this.mqtt.unsubscribeAsync(inputsTopic);
      };
      this.registerMessageCallback(inputsTopic, callback);
    });

    await this.send(message);

    const response = await waitInputPromise;

    return JSON.parse(response);
  }

  public publish(topic: string, payload: any): void {
    this.mqtt.publish(topic, JSON.stringify(payload), { qos: 1 });
  }

  public async disconnect(): Promise<void> {
    await this.mqtt.endAsync();
  }
}
