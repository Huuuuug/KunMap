import { ElementProps, Element, Circle } from "zrender";
import { BasicElement } from "../BasicElement";
import { Projection } from "../utils/Projection";
import { antiShake } from "../utils/AntiShake";

export interface PointsOption {
  /** 点数据 */
  data?: Point | Point[];
}

export interface Point {
  /** 经度 */
  lon: number;
  /** 纬度 */
  lat: number;
  /** 点的图形 */
  shape?: Element<ElementProps>;
  /** 点分类组名 用于点的显示隐藏与移除 */
  keys?: string[];
  /** 若不自定义图形 圆形的颜色 */
  color?: string;
}

export class Points extends BasicElement {
  private _option: PointsOption = {
    data: undefined,
  };
  /** 数据集是否混乱 */
  private _dirty = false;
  /** 点数据集 */
  private _datas: Point[] = [];
  /** 被隐藏的点的组名 */
  private _hiddenKeys = new Set();
  /** 绘制点 **/
  private _drawPoints() {
    console.log(this._datas);
    const map = this._map!;
    this.root.removeAll();
    const activeDatas: Point[] = [];
    const { east, west, south, north } = map.border;
    this._datas.forEach((e: Point) => {
      // 排除屏幕外的点
      if (e.lon < west || e.lon > east || e.lat < south || e.lat > north)
        return;
      if (e.keys?.some((e: string) => this._hiddenKeys.has(e))) return;
      activeDatas.push(e);
      activeDatas.forEach((e: Point) => {
        this.root.add(e.shape!);
      });
    });
  }
  constructor(name: string, option?: Partial<PointsOption>) {
    super(name);
    Object.assign(this._option, option);
    this._drawPoints = antiShake(this._drawPoints.bind(this));
  }

  /** 缩放结束回调 */
  onZoomEnd(): void {
    this._drawPoints();
  }
  /** 鼠标事件回调 */
  onMoveEnd(): void {
    this._drawPoints();
  }
  /**
   * 添加点
   * @param target 目标点或点数组
   */
  add(target: Point | Point[]) {
    if (target instanceof Array) {
      target.forEach((e: Point) => {
        this.add(e);
      });
    } else {
      if (!target.shape) {
        // 默认生成一个红色的实心圆
        target.shape = new Circle({
          z: 10,
          globalScaleRatio: 0,
          shape: {
            r: 5,
          },
          style: {
            fill: target.color || "#000",
          },
        });
      }

      target.shape.attr({
        x: Projection.lonToX(target.lon),
        y: Projection.latToY(target.lat),
      });
      this._datas.push({
        keys: [],
        ...target,
      });
      if (this._map) {
        this._drawPoints();
      }
    }
  }
  /**
   * 隐藏部分点
   * @param key 要隐藏的点的组名或组名集合
   */
  hidePoints(key: string | string[]) {
    if (key instanceof Array) {
      key.forEach((name: string) => {
        this._hiddenKeys.add(name);
      });
    } else {
      this._hiddenKeys.add(key);
    }
    this._drawPoints();
  }
  /**
   * 显示部分点
   * @param key 要显示的点的组名或组名集合
   */
  showPoints(key: string | string[]) {
    if (key instanceof Array) {
      key.forEach((name: string) => {
        this._hiddenKeys.has(name) && this._hiddenKeys.delete(name);
      });
    } else {
      this._hiddenKeys.has(key) && this._hiddenKeys.delete(key);
    }
    this._drawPoints();
  }
}
