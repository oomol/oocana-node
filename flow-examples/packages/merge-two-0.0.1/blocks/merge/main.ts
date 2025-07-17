import type { MainFunction } from "@oomol/oocana-types";
import merge from "lodash.merge";

interface CounterInputs {
  one: string;
}

interface CounterOutput {}

const main: MainFunction<CounterInputs, CounterOutput> = async (
  _inputs,
  _context
) => {
  console.log("merge", merge({ a: 1 }, { b: 2 }));
};

export default main;
