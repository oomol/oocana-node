import { BlockInfo } from "./external/block";

export interface IReporterBlockMessage extends BlockInfo {
  type: "BlockMessage";
  payload: any;
}

export interface IReporterBlockPreview extends BlockInfo {
  type: "BlockPreview";
  payload: any;
}

export interface IReporterBlockLogJSON extends BlockInfo {
  type: "BlockLogJSON";
  json: unknown;
}

export interface IReporterBlockLog extends BlockInfo {
  type: "BlockLog";
  log: string;
  stdio: "stdout" | "stderr";
}

export interface IReporterBlockProgress extends BlockInfo {
  type: "BlockProgress";
  /** 0 ~ 100 */
  rate: number;
}

export interface IReporterBlockWarning extends BlockInfo {
  type: "BlockWarning";
  warning: string;
}

export type IReporterClientMessage =
  | IReporterBlockMessage
  | IReporterBlockPreview
  | IReporterBlockLogJSON
  | IReporterBlockLog
  | IReporterBlockWarning
  | IReporterBlockProgress;

export type LocalizeInfo = {
  localize: {
    $key: string;
    [key: string | number]: string | number | LocalizeInfo;
  };
};
