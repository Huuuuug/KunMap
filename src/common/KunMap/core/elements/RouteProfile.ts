import { BasicElement } from "../BasicElement";
import { Rect } from "zrender";
import cursor from "../../assets/Cursor.png";

export interface RouteProfileOptions {
  cursorIcon: string;
}

export class RouteProfile extends BasicElement {
  private _option: RouteProfileOptions = {
    cursorIcon: cursor,
  };
  private _container = new Rect({
    cursor: cursor,
    shape: {
      width: 100,
      height: 100,
    },
    zlevel: 2,
    style: {
      fill: "#000000",
    },
  });
  constructor(name: string, option?: Partial<RouteProfileOptions>) {
    super(name);
    Object.assign(this._option, option);
  }

  drawProfile() {
    this.root.removeAll();
    this.root.add(this._container);
  }
}
