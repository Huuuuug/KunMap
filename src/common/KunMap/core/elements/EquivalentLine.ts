import { CompoundPath } from "zrender";
import { BasicElement } from "../BasicElement";
import { Grid } from "./Grid";

export interface EquivalentLineOption {
  grid: Grid;
  legend: [number, string][];
}

export class EquivalentLine extends BasicElement {
  private _option: Partial<EquivalentLineOption> = {};

  private _dealLine(
    line: [number, number][],
    path: Map<string, CompoundPath>,
    relevance: {
      zoom: number;
      width: number;
    }
  ) {
    const { grid, legend } = this._option;
  }
  constructor(name: string, option: EquivalentLineOption) {
    super(name);
    Object.assign(this._option, option);
  }
}
