import type { MainFunction } from "@oomol/oocana-types";

interface CounterInputs {
  "in-d-1": string;
  "in-d-2": string;
}

interface CounterOutput {
  "output-d-1": string;
}

export const main: MainFunction<CounterInputs, CounterOutput> = async (
  inputs,
  context
) => {
  await context.output(
    "output-d-1",
    `${inputs["in-d-1"]}/${inputs["in-d-2"]}`,
    true
  );
};
