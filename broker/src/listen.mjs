/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Aedes from "aedes";
import { createServer } from "node:net";
import { createLogger, transports } from "winston";

const logger = createLogger({
  level: "info",
  transports: [
    new transports.Console(),
    new transports.File({ filename: "broker.log" }),
  ],
});

function listen(port) {
  const aedes = new Aedes();
  const server = createServer(aedes.handle);
  server.listen(port, () => {
    logger.info(`MQTT broker listening on port ${port}`);
  });
  aedes.on("clientError", (client, err) => {
    logger.info(`clientError ${client.id} ${err.message}`);
  });
  aedes.on("client", client => {
    logger.info(`client connected ${client.id}`);
  });
  aedes.on("clientDisconnect", client => {
    logger.info(`client disconnected ${client.id}`);
  });
  aedes.on("subscribe", (subscriptions, client) => {
    logger.info(`subscribe from client `, {
      id: client.id,
      subscriptions,
    });
  });

  aedes.subscribe(
    "#",
    (packet, callback) => {
      if (!packet.topic.startsWith("$SYS")) {
        logger.info(
          `date: ${new Date().toLocaleString()} topic: ${packet.topic} cmd: ${
            packet.cmd
          }`,
          {
            payload: packet.payload.toString(),
          }
        );
      }
      callback();
    },
    () => {
      logger.info("Subscribed to all topics");
    }
  );
  return () =>
    new Promise((resolve, reject) =>
      server.close(err => (err ? resolve() : reject(err)))
    );
}

export { listen };
