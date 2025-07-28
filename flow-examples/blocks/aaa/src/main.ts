import type { MainFunction } from "@oomol/oocana-types";

interface Inputs {
  input: string;
}

interface Output {
  output: string;
}

export const main: MainFunction<Inputs, Output> = async (inputs, context) => {
  const output = inputs.input;

  return {
    output,
  };
};
