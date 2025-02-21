import type { MainFunction } from "@oomol/oocana-types";
import equal from "lodash.isequal";

interface CounterInputs {
  one: string;
}

interface CounterOutput {}

const main: MainFunction<CounterInputs, CounterOutput> = async (
  _inputs,
  context
) => {
  console.log("isequal", equal({ a: 1 }, { a: 1 }));

  if (process.env["OOMOL_VAR"] != "1") {
    throw new Error("OOMOL_VAR set");
  }

  if (process.env["VAR"] != "1") {
    throw new Error("VAR not set");
  }
};

export default main;
