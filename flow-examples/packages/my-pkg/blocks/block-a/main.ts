import type { MainFunction } from "@oomol/oocana-types";

import { foo } from "~/utils";

interface CounterInputs {
  "in-a": string;
}

interface CounterOutput {
  "output-a-1": Date;
  "output-a-2": string;
  "output-a-3": string;
}

const main: MainFunction<CounterInputs, CounterOutput> = async (
  _inputs,
  context
) => {
  console.assert(foo === 1, "should resolve tsconfig paths");
  context.sendMessage("a message from block-a");
  context.logJSON({ data: "an json object" });
  await context.output("output-a-1", new Date());
  await context.output("output-a-2", "a-2");
  await context.output("output-a-3", "new Date()");
};

export default main;
