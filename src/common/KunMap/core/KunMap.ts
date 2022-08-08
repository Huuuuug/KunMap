import { Projection } from "./utils/Projection";
import { Group, init, Rect, ZRenderType } from "zrender";
import { BasicElement } from "./BasicElement";

/** 缩放等级为0时的缩放系数 */
export const ScaleUnit = 0.000006388019798183265;

interface KunMapOption {
  /** 是否显示 */
  show: boolean;
  /** 地图初始中心坐标 默认:[130,20] */
  center: [number, number];
  /** 地图初始缩放等级：默认：7 */
  zoom: number;
  /** 缩放间隔 默认：1 */
  zoomDelta: number;
  /** 缩进动画时间(毫秒) 默认：200*/
  zoomDuring: number;
  /** 最小缩放等级 */
  minZoomLevel: number;
  /** 最大缩放等级 */
  maxZoomLevel: number;
  /** 屏幕像素比 */
  screenPixel: number;
  /** 背景色 */
  backgroundColor: string;
  /** 保留内部元素 */
  keepContent: boolean;
}

export class KunMap {
  /** zrender实例 */
  readonly zr: ZRenderType;
  /** 全局根节点，通过平移缩放将内部坐标转化为伪墨卡托坐标  */
  /** 地图内部元素集合 */
  readonly elements = new Map<string, BasicElement>();
  readonly root = new Group();
  private _option: KunMapOption = {
    show: true,
    center: [130, 20],
    zoom: 7,
    zoomDelta: 1,
    zoomDuring: 200,
    minZoomLevel: 1,
    maxZoomLevel: 18,
    screenPixel: window.devicePixelRatio,
    backgroundColor: "#000",
    keepContent: false,
  };
  constructor(dom: HTMLDivElement, option: Partial<KunMapOption> = {}) {
    Object.assign(this._option, option);

    const _temp = [];
    let element = dom.children.item(0);
    /** 生成zr实例 判断是否保留容器原来的元素 */
    if (this._option.keepContent) {
      while (element) {
        _temp.push(element);
        element.remove();
        element = dom.children.item(0);
      }
      this.zr = init(dom, {
        devicePixelRatio: this._option.screenPixel,
      });
      _temp.forEach((e) => {
        dom.appendChild(e);
      });
    } else {
      this.zr = init(dom, {
        devicePixelRatio: this._option.screenPixel,
      });
    }
    /** 添加背景颜色 */
    if (this._option.backgroundColor) {
      this.zr.add(
        new Rect({
          silent: true,
          shape: {
            width: dom.offsetWidth,
            height: dom.offsetHeight,
          },
          style: {
            fill: this._option.backgroundColor,
          },
        })
      );
    }

    this.zr.add(this.root);
    this.setCurrentView(
      this._option.center[0],
      this._option.center[1],
      option.zoom
    );
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  get show() {
    return this._option.show;
  }
  /** 画布尺寸 */
  get size() {
    return { x: this.zr.dom!.offsetWidth, y: this.zr.dom!.offsetHeight };
  }
  /** 地图缩放等级 */
  get zoom() {
    return Math.log2(this.root.scaleX / ScaleUnit);
  }
  /**
   * 设置当前视图
   * @param lon 中心经度
   * @param lat 中心纬度
   * @param zoom 缩放等级,默认：当前等级
   */
  setCurrentView(lon: number, lat: number, zoom: number = this.zoom) {
    const scale = ScaleUnit * Math.pow(2, zoom);
    const x = Projection.lonToX(lon);
    const y = Projection.latToY(lat);
    const { size } = this;
    this.root.attr({
      x: size.x / 2 - x * scale,
      y: y * scale + size.y / 2,
      scaleX: scale,
      scaleY: -scale,
    });
    this.elements.forEach((e) => {
      e.onZoomEnd && e.onZoomEnd();
    });
  }
  /**
   * 添加元素到根元素root上
   * @param e 元素
   */
  add(e: BasicElement) {
    if (this.elements.has(e.name)) {
      if (this.elements.get(e.name) !== e) {
        throw new Error("已存在同名要素");
      }
    } else {
      this.elements.set(e.name, e);
      this.root.add(e.root);
      e.addTo(this);
    }
  }
  /**
   * 从root上删除元素
   * @param name 元素的名称
   */
  delete(name: string) {
    const element = this.elements.get(name);
    if (element) {
      this.elements.delete(name);
      this.root.remove(element.root);
      element.remove();
    }
  }
  /**
   * 鼠标移动事件
   * @param e 鼠标事件
   */
  handleMouseMove(e: MouseEvent) {
    if (!this.show) return;
    if (Number.isFinite(e.movementX)) {
      this.root.attr({
        x: this.root.x + e.movementX,
        y: this.root.y + e.movementY,
      });
      this.elements.forEach((e) => e.onMove());
    }
  }
  handleMouseUp() {
    if (!this.show) return;
  }
}
