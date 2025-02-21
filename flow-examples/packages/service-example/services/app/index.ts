import type { Context, ServiceContext } from "@oomol/oocana-types";

export async function main(serviceContext: ServiceContext) {
  serviceContext.blockHandler = {
    one: async (inputs: any, context: Context) => {
      context.sendMessage("block one has run.");
      context.sendMessage("inputs: " + JSON.stringify(inputs));
      return {
        one: 1,
      };
    },
    app: async (inputs: any, context: Context) => {
      context.sendMessage("block app has run.");
      context.sendMessage("inputs: " + JSON.stringify(inputs));
      return {
        app: 1,
      };
    },
  };
}
