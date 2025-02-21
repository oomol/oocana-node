import { MainFunction, Context } from "./external/context";

/** @deprecated use Context instead */
export type VocanaSDK<
  TInputs = Record<string, any>,
  TOutputs = Record<string, any>
> = Context<TInputs, TOutputs>;

/** @deprecated use MainFunction instead */
export type VocanaMainFunction<
  TInputs = Record<string, any>,
  TOutputs = Record<string, any>
> = MainFunction<TInputs, TOutputs>;

/** @deprecated use Context */
export type SDK<
  TInputs = Record<string, any>,
  TOutputs = Record<string, any>
> = Context<TInputs, TOutputs>;
