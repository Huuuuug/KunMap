import { ElementEvent } from "zrender";
import { KunMap } from "../KunMap";

export class MapEventGroup {
  readonly maps: KunMap[] = [];
  // 仅支持PC端
  constructor() {
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  onMouseDown() {
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
  }
  /** 鼠标移动事件 */
  onMouseMove(e: MouseEvent) {
    this.maps.forEach((map) => {
      map.handleMouseMove(e);
    });
  }
  /** 鼠标抬起事件 */
  onMouseUp() {
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
    this.maps.forEach((map) => {
      map.handleMouseUp();
    });
  }
  /** */
  onMouseWheel(e: ElementEvent) {
    this.maps.forEach((map) => {
      map.handleMouseWheel(e);
    });
  }
}
