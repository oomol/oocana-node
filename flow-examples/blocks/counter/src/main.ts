import type { VocanaMainFunction } from "@oomol/oocana-types";

interface CounterInputs {
  count?: number;
  default_count?: number;
}

interface CounterOutput {
  "output-1": number;
}

export const main: VocanaMainFunction<CounterInputs, CounterOutput> = async (
  inputs,
  context
) => {
  const { count = context.inputs.default_count || 0 } = inputs;
  const output = count + 1;

  console.log(
    `Block Job '${context.jobId}' input: ${count}, output: ${output}`
  );

  console.log(inputs, context);

  await context.output("output-1", output);
};
