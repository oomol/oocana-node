import type { MainFunction } from "@oomol/oocana-types";

interface CounterInputs {
  "in-b"?: Date;
}

interface CounterOutput {
  "output-b-1": string;
}

export const main: MainFunction<CounterInputs, CounterOutput> = async (
  inputs,
  context
) => {
  const inB = inputs["in-b"];
  if (inB instanceof Date) {
    console.log("inB is a date");
  } else {
    console.log("inB is not a date");
  }
  await context.output("output-b-1", inB?.toString() || "none input");
};
