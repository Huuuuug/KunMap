import { BasicElement } from "../BasicElement";
import { LinearGradient, Rect } from "zrender";
// import cursor from "../../assets/Cursor.png";
import cursor from "../../assets/cursor.cur";

export interface RouteProfileOptions {
  cursorIcon: string;
}

export class RouteProfile extends BasicElement {
  private _option: RouteProfileOptions = {
    cursorIcon: 'pointer',
  };
  private _container = new Rect({
    cursor:`pointer`,
    zlevel: 2,
    style: {
      fill: "#000000",
    },
  });
  private _initialLabel = new Rect({
    silent:true,
    globalScaleRatio:0,
    shape: {
      width:68,
      height:23
    },
    style: {
      stroke: new LinearGradient(0,0,0,1,[{
        color: '#0000CC',
        offset: 0
      },{
        color:'#6600FF',
        offset: 1
      }])
    }
  })
  constructor(name: string, option?: Partial<RouteProfileOptions>) {
    super(name);
    Object.assign(this._option, option);
  }
  
  /** 设置画布大小 */
  private _setContainerSize() {
    const map = this._map!
    const size = map.size
    const startPoint = [-map.root.x / map.root.scaleX,-map.root.y /map.root.scaleY ]
    this._container.attr({
      x:startPoint[0],
      y:startPoint[1],
      shape: {
        width:size.x / map.root.scaleX,
        height: size.y / map.root.scaleY
      }
    })
    
  }
  onZoomEnd() {
    this._setContainerSize()
  }
  onMoveEnd() {
    this._setContainerSize()
  }

  drawProfile() {
    this.root.removeAll();
    this.root.add(this._container);
  }
}
