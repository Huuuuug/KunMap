import { Group } from "zrender";
import { KunMap } from "./KunMap";

export class BasicElement {
  /** 元素名,元素的唯一标识 */
  readonly name: string;
  /** 内部图元根节点 */
  readonly root = new Group();
  /** 地图实例 */
  protected _map?: KunMap;
  constructor(name: string) {
    this.name = name;
  }
  /** 是否显示 */
  get show() {
    return !this.root.ignore;
  }
  set show(val) {
    if (val != this.show) {
      if (val) {
        this.root.show();
        this.onZoomEnd();
      } else {
        this.root.hide();
      }
    }
  }

  addTo(map: KunMap) {
    if (map === this._map) {
      return this;
    }
    if (this._map) {
      throw new Error("该元素已被其他地图实例占用");
    }
    this._map = map;
    map.add(this);
    this.onZoomEnd();
    return this;
  }

  remove() {
    if (this._map) {
      const map = this._map;
      this._map = undefined;
      map.delete(this.name);
    }
    return this;
  }

  /** 地图平移时的回调 */
  onMove() {
    console.log("onMove");
  }
  /** 地图平移结束时的回调 */
  onMoveEnd() {
    console.log("onMoveEnd");
  }
  /** 地图缩放开始时的回调 */
  onZoomStart() {
    console.log("onZoomStart");
  }
  /** 地图缩放结束时的回调 */
  onZoomEnd() {
    console.log("onZoomEnd");
  }
}
