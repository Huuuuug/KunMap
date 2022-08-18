import { Projection } from "./utils/Projection";
import {
  BoundingRect,
  ElementEvent,
  ElementProps,
  Element,
  Group,
  init,
  Rect,
  ZRenderType,
} from "zrender";
import { BasicElement } from "./BasicElement";
import { MapEventGroup } from "./utils/MapEventGroup";
import Animator from "zrender/lib/animation/Animator";

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
  readonly root = new Group();
  /** 地图内部元素集合 */
  readonly elements = new Map<string, BasicElement>();
  /** 缩放时的动画对象 */
  private _zoomAnimator: Animator<any> | undefined;
  private _mapEventGroup: MapEventGroup | undefined;
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
  private _touches?: TouchList;
  /** 当鼠标按下zr容器 */
  private _onMouseDown(e: ElementEvent) {
    // if (e.target) {
    //   let _target = e.target
    //   do {
    //     if (_target.draggable) {
    //       return
    //     }
    //     _target = _target.parent
    //   } while (_target)
    // }
    if (this._mapEventGroup) {
      this._mapEventGroup.onMouseDown();
    } else {
      if (e.zrByTouch) {
        // 移动端
        if (!this._touches) {
          document.addEventListener("touchmove", this.handleTouchmove);
          document.addEventListener("touchend", this.handleTouchEnd);
        }
        this._touches = (e.event as any).touches;
      } else {
        // PC端
        document.addEventListener("mousemove", this.handleMouseMove);
        document.addEventListener("mouseup", this.handleMouseUp);
      }
    }
    e.event.preventDefault();
  }
  private _onMouseWheel(e: ElementEvent) {
    if (this._mapEventGroup) {
      this._mapEventGroup.onMouseWheel(e);
    } else {
      this.handleMouseWheel(e);
    }
  }
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
    this.handleTouchmove = this.handleTouchmove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.zr.on("mousedown", this._onMouseDown, this);
    this.zr.on("mousewheel", this._onMouseWheel, this);
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
  /** 地图中心经纬度 */
  get center() {
    const { size } = this;
    const x = size.x / 2 - this.root.x;
    const y = size.y / 2 - this.root.y;
    return [
      Projection.xToLon(x / this.root.scaleX),
      Projection.yToLat(y / this.root.scaleY),
    ];
  }
  /** 边界 */
  get border() {
    const { size, root } = this;
    return {
      east: Projection.xToLon((size.x - root.x) / root.scaleX),
      west: Projection.xToLon(-root.x / root.scaleX),
      south: Projection.yToLat((size.y - root.y) / root.scaleY),
      north: Projection.yToLat(-root.y / root.scaleY),
    };
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
      //** 鼠标移动事件回调 */
      // this.elements.forEach((e) => e.onMove());
    }
  }
  /** 当鼠标抬起时 */
  handleMouseUp() {
    if (!this.show) return;
    if (!this._mapEventGroup) {
      document.removeEventListener("mousemove", this.handleMouseMove);
      document.removeEventListener("mouseup", this.handleMouseUp);
    }
    //** 鼠标抬起事件回调 */
    this.elements.forEach((e) => e.onMoveEnd());
  }
  /** 鼠标滑轮事件 */
  handleMouseWheel(e: ElementEvent) {
    if (!this.show) return;
    if (this._zoomAnimator) {
      return;
    }
    let delta = e.wheelDelta * this._option.zoomDelta;
    const zoom = this.zoom;
    delta = Math.max(this._option.minZoomLevel - zoom, delta);
    delta = Math.min(this._option.maxZoomLevel - zoom, delta);
    if (delta) {
      const scale = Math.pow(2, delta);
      this.elements.forEach((e) => {
        e.onZoomStart && e.onZoomStart();
      });
      this._zoomAnimator = this.root
        .animate("", false)
        .when(this._option.zoomDuring, {
          x: e.offsetX + (this.root.x - e.offsetX) * scale,
          y: e.offsetY + (this.root.y - e.offsetY) * scale,
          scaleX: this.root.scaleX * scale,
          scaleY: this.root.scaleY * scale,
        })
        .start()
        .done(() => {
          this._zoomAnimator = undefined;
          this.elements.forEach((e) => {
            e.onZoomEnd && e.onZoomEnd();
          });
        });
    }
    e.event.preventDefault();
  }
  /** TODO 移动端移动 */
  handleTouchmove() {
    throw new Error("TODO");
  }
  /** TODO 移动端移动 */
  handleTouchEnd() {
    throw new Error("TODO");
  }
  /** 定位到指定经纬度 */
  locate(lon: number, lat: number, zoom: number = this.zoom) {
    if (this._zoomAnimator) {
      return;
    }
    const scale = ScaleUnit * Math.pow(2, zoom);
    const x = Projection.lonToX(lon);
    const y = Projection.latToY(lat);
    const { size } = this;
    this._zoomAnimator = this.root
      .animate("", false)
      .when(this._option.zoomDuring, {
        x: size.x / 2 - x * scale,
        y: y * scale + size.y / 2,
        scaleX: scale,
        scaleY: -scale,
      })
      .start("exponentialIn")
      .done(() => {
        this._zoomAnimator = undefined;
        this.elements.forEach((e) => {
          e.onZoomEnd && e.onZoomEnd();
        });
      });
  }
  /** 定位到初始状态 */
  zoomToCenter() {
    this.locate(
      this._option.center[0],
      this._option.center[1],
      this._option.zoom
    );
  }
  /** 缩小 */
  zoomIn() {
    const center = this.center;
    this.locate(center[0], center[1], this.zoom - this._option.zoomDelta);
  }
  /** 放大 */
  zoomOut() {
    const center = this.center;
    this.locate(center[0], center[1], this.zoom + this._option.zoomDelta);
  }
  /**
   * 缩放至指定图元
   * @param target 目标图元或者包围盒
   * @param scale 缩放系数
   * @param offset 中心偏移
   */
  zoomTo(
    target: Element<ElementProps> | BoundingRect,
    scale = 1,
    offset = [0, 0]
  ) {
    const boundingBox =
      target instanceof BoundingRect ? target : target.getBoundingRect();
    const lon = Projection.xToLon(
      boundingBox.x + boundingBox.width / 2 - offset[0] / this.root.scaleX
    );
    const lat = Projection.yToLat(
      boundingBox.y + boundingBox.height / 2 - offset[1] / this.root.scaleY
    );
    const size = this.size;
    const zoom =
      Math.log2(
        Math.min(
          size.x / (boundingBox.width * ScaleUnit),
          size.y / (boundingBox.height * ScaleUnit)
        )
      ) + Math.log2(scale);
    this.locate(
      lon,
      lat,
      Math.min(
        Math.max(this._option.minZoomLevel, zoom),
        this._option.maxZoomLevel
      )
    );
  }
}
