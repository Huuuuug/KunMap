import { KunMap } from "../KunMap";

export class MapEventGroup {
  readonly maps: KunMap[] = [];
  constructor() {}

  onMouseDown() {
    document.addEventListener("mousemove", this.onMouseMove);
  }
  /** 鼠标移动事件 */
  onMouseMove(e: MouseEvent) {
    this.maps.forEach(map);
  }
}
