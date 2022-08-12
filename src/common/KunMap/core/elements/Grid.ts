import { TextStyleProps } from "zrender";
import { BasicElement } from "../BasicElement";
import { Boundary } from "./Boundary";

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
  setGridByPNG(url?: string) {
    console.log("TODO");
  }
}
