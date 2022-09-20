import { BasicElement } from "../BasicElement";
import { numberToColor } from "../utils/OthersUtils";
import { Grid } from "./Grid";
import { BufferGeometry } from "three";

export interface IsosurfaceOptions {
  values?: number[];
  /** 格点区间 */
  grid: Grid;
  /** 图例 */
  legend?: [number, string][];
  /** 是否显示 */
  show?: boolean;
}

export class Isosurface extends BasicElement {
  private _option: Required<IsosurfaceOptions>;
  constructor(name: string, option: IsosurfaceOptions) {
    super(name);
    let legend: [number, string][] = [];
    if (option.values) {
      legend = option.values.map((e, i) => {
        return [e, numberToColor(i)];
      });
    }
    this._option = Object.assign(
      {
        values: [],
        legend,
        show: true,
      },
      option
    );

    this.grid.event.on("change", this._updateChoroplethic, this);
  }
  /** 格点数据 */
  get grid() {
    return this._option.grid;
  }

  private _updateChoroplethic() {
    if (this.grid && this.grid.rows) {
      const { grid } = this;
      const { columns: width, rows: height, east, west, north, south } = grid;
      const geometry = new BufferGeometry();
    }
  }
}
