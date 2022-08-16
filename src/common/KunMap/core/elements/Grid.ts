import { TextStyleProps } from "zrender";
import { BasicElement } from "../BasicElement";
import { Boundary } from "./Boundary";
import { readJsonByImg } from "../utils/ReadJsonByPng";
import Eventful from "zrender/lib/core/Eventful";
import { OneDimensional } from "../utils/OneDimensional";

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
  }
}
