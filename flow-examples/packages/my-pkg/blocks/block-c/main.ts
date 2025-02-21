import type { MainFunction } from "@oomol/oocana-types";

interface CounterInputs {
  "in-c-1": string;
  "in-c-2": string;
}

interface CounterOutput {
  "output-c-1": string;
}

export const main: MainFunction<CounterInputs, CounterOutput> = async (
  inputs,
  context
) => {
  await context.output("output-c-1", `${inputs["in-c-1"]}/${inputs["in-c-2"]}`);
};
