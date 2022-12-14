import { TextStyleProps, Text } from "zrender";
import { BasicElement } from "../BasicElement";
import { Boundary } from "./Boundary";
import { readJsonByImg } from "../utils/ReadJsonByPng";
import Eventful from "zrender/lib/core/Eventful";
import { OneDimensional } from "../utils/OneDimensional";
import { Projection } from "../utils/Projection";

export interface GridOption {
  /** 相对 */
  z: number;
  /** 样式 */
  style: TextStyleProps;
  /** 保留小数位数 */
  fixed: number;
  /** 格点的最小空间像素，控制网格疏密 */
  space: number;
  /** 裁剪 */
  clip?: Boundary;
}

export class Grid extends BasicElement {
  readonly event = new Eventful<{
    clip: () => void;
    error: (msg: string) => void;
    change: () => void;
    frame: () => void;
  }>();
  private _option: GridOption = {
    z: 100,
    style: {
      fill: "#000000",
      fontSize: 20,
      align: "center",
      verticalAlign: "middle",
      fontFamily: "黑体",
    },
    fixed: 0,
    space: 80,
  };
  _max?: number;
  /** 经度索引映射关系 */
  iToLon = new OneDimensional([0, 1]);
  /** 纬度索引映射关系 */
  jToLat = new OneDimensional([0, 1]);
  /** 格点数据 */
  data: number[][] = [];
  get clip() {
    return this._option.clip;
  }
  /** 格点行数 */
  get rows() {
    return this.data.length;
  }
  /** 格点列数 */
  get columns() {
    return this.data.length && this.data[0].length;
  }
  /** 东边界 */
  get east() {
    return this.iToLon.forward(this.columns - 0.5);
  }
  /** 西边界 */
  get west() {
    return this.iToLon.forward(-0.5);
  }
  /** 北边界 */
  get north() {
    return this.jToLat.forward(this.rows - 0.5);
  }
  /** 南边界 */
  get south() {
    return this.jToLat.forward(-0.5);
  }
  /** 裁剪边界缓存 */
  private _clipInfo: boolean[][] = [];
  /** 裁剪网格 */
  private _updateClip() {
    if (this._clipInfo.length > 0) this._clipInfo = [];
    if (this._option.clip && this._option.clip.paths.length > 0) {
      const { rows: height, columns: width } = this;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#000";
      this._option.clip.paths.forEach((e) => {
        e.shape.points.forEach((p: [number, number], ind: number) => {
          const lon = Projection.xToLon(p[0]);
          const lat = Projection.yToLat(p[1]);
          const i = this.iToLon.backward(lon);
          const j = this.jToLat.backward(lat);
          if (ind) {
            ctx.lineTo(i + 0.5, j + 0.5);
          } else {
            ctx.moveTo(i + 0.5, j + 0.5);
          }
        });
      });
      ctx.fill();
      const { data } = ctx.getImageData(0, 0, width, height);
      for (let i = 0, j = 3; i < height; i++) {
        const row: boolean[] = [];
        for (let m = 0; m < width; m++, j += 4) {
          row.push(data[j] > 128);
        }
        this._clipInfo.push(row);
      }
    }
    this._drawGrid();
  }
  /** 绘制格点图 */
  private _drawGrid() {
    if (!this._map) return;
    this.root.removeAll();
    if (this.show && this.columns) {
      const { rows: width, columns: height } = this;
      const map = this._map;
      const size = map.size;
      const boundary = map.border;
      const min_i = Math.max(0, this.iToLon.backward(boundary.west));
      const max_i = Math.min(height - 1, this.iToLon.backward(boundary.east));
      const min_j = Math.max(0, this.jToLat.backward(boundary.south));
      const max_j = Math.min(width - 1, this.jToLat.backward(boundary.north));
      const step =
        Math.round(
          (this.iToLon.backward(boundary.east) -
            this.iToLon.backward(boundary.west)) /
            (size.x / this._option.space)
        ) < 1
          ? 1
          : Math.round(
              (this.iToLon.backward(boundary.east) -
                this.iToLon.backward(boundary.west)) /
                (size.x / this._option.space)
            );
      const offset = Math.round((height % step) / 2);

      for (
        let j = Math.floor(min_j / step) * step + offset;
        j <= max_j;
        j += step
      ) {
        const lat = this.jToLat.forward(j);
        for (
          let i = Math.floor(min_i / step) * step + offset;
          i <= max_i;
          i += step
        ) {
          if (
            this._clipInfo &&
            this._clipInfo[j] &&
            this._clipInfo[j][i] === false
          ) {
            continue;
          }
          if (Number.isNaN(this.data[j][i])) {
            continue;
          }
          const lon = this.iToLon.forward(i);
          const x = Projection.lonToX(lon);
          const y = Projection.latToY(lat);
          const text = new Text({
            silent: true,
            x,
            y,
            scaleY: -1,
            globalScaleRatio: 0,
            style: {
              ...this._option.style,
              text: this.data[j][i].toFixed(this._option.fixed),
            },
            z: this._option.z,
          });
          // if (this._option.gridFormatter) {
          //   this._option.gridFormatter(text, this.data[j][i])
          // }
          this.root.add(text);
        }
      }
    } else {
      this.root.dirty();
    }
  }
  constructor(name: string, option: Partial<GridOption> = {}) {
    super(name);
    const style = Object.assign(this._option.style, option.style);
    Object.assign(this._option, option);
    this._option.style = style;
  }
  /**
   * 通过图片设置数据
   * @param url 图片路径
   */
  async setGridByPNG(url?: string) {
    if (url) {
      const res = await readJsonByImg(url);
      if (!res) {
        this.data = [];
        this.event.trigger("error", "数据为空");
      } else {
        const east = Math.max(res.eLon, res.sLon);
        const west = Math.min(res.eLon, res.sLon);
        const north = Math.max(res.eLat, res.sLat);
        const south = Math.min(res.eLat, res.sLat);
        const data: number[][] = [];
        for (let i = 0; i < res.height; i++) {
          data.push(res.data.slice(i * res.width, (i + 1) * res.width));
        }
        this.iToLon = new OneDimensional([0, res.width - 1], [west, east]);
        this.jToLat = new OneDimensional([0, res.height - 1], [south, north]);
        this.data = data.reverse();
      }
    } else {
      this.data = [];
    }
    this._max = undefined;
    if (this._option.clip) {
      this._updateClip();
    } else {
      this._drawGrid();
    }
    this.event.trigger("change");
  }
  /**
   * 通过点获取格点值
   * @param point 经纬度
   * @returns 格点值
   */
  getGridValue(point: [number, number]) {
    if (this.rows) {
      const { data } = this;
      const i = this.iToLon.backward(point[0]);
      const j = this.jToLat.backward(point[1]);
      const i0 = Math.floor(i);
      const j0 = Math.floor(j);
      const i1 = i0 + 1;
      const j1 = j0 + 1;
      if (i0 < 0 || j0 < 0 || i1 > this.columns - 1 || j1 > this.rows - 1) {
        return false;
      }
      if (this._option.clip) {
        if (
          !this._clipInfo[j0][i0] &&
          !this._clipInfo[j0][i1] &&
          !this._clipInfo[j1][i0] &&
          !this._clipInfo[j1][i1]
        ) {
          return false;
        }
      }
      const v0 = new OneDimensional(
        [i0, i1],
        [data[j0][i0], data[j0][i1]]
      ).forward(i);
      const v1 = new OneDimensional(
        [i0, i1],
        [data[j1][i0], data[j1][i1]]
      ).forward(i);
      return new OneDimensional([j0, j1], [v0, v1]).forward(j);
    } else {
      return false;
    }
  }

  /** 地图缩放重载 */
  onZoomEnd() {
    // 地图缩放重新绘制格点
    this._drawGrid();
  }
  /** 移动回调 */
  onMoveEnd() {
    // 移动屏幕之后重绘
    this._drawGrid();
  }
}
