import { BasicElement } from "../BasicElement";
import {
  Group,
  LinearGradient,
  Polyline,
  Rect,
  Text,
  Circle,
  Image,
} from "zrender";

import cursor from "./cursor.cur";

const airplane =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAaCAYAAACtv5zzAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAGpSURBVHgB7VXLUcMwEN01uXBzCaYCkg6SCoAbw/BJKsAdBCqAFMAQPvekA6ACoANTARmufJa3iQZkRbaUzHBgJjvjsaXVvrfSPq2J/th4kcUHIt2EaBNBgyFzERMTTaDgWHxphgWIWiCZhOISijSA961h9kV0FBMXRdAVyRTUIWzGxEbvYFlbEfwDAigolV/9/xjm2nsiQSUlAXDV+6OCedxZAz5cwJyWIdgX2VZwcvTvGu7D2aHISY1/3kxAnxYw7HK8RtRz20eJQM8bWZ9TZBvwmPaojt0I2QLX8x5RZAuIJUkMeBPgdz5wbP3eFPnJcXXV5yGYCkNrOCXAR7uimAXmd26YO3ge2CH4IHpWnyEvnNgUmY9UYQl7gDW7a+aNW+axNV8q3jrRq76VXNeCqOcS6c/JlukEGee6GM+VQ6pHVQq+YH6xxyAa+oiS99k55m9EmvGAqi21B6o43yKbSGsU9cusuBdzkvRZkCBw6YIkHADXS3dM9VZLUtuLbHCj+RzybOF7aC3NPtGPqnAaVQ6eFXViwMYqR8vd2xU5RfAWMtRumlbhfANoIqX3tm+urAAAAABJRU5ErkJggg==";

export interface RouteProfileOptions {
  cursorIcon: string;
}

export class RouteProfile extends BasicElement {
  private _option: RouteProfileOptions = {
    cursorIcon: "pointer",
  };
  /** 画布 */
  private _container = new Rect({
    cursor: `pointer`,
    zlevel: 2,
    style: {
      fill: "#000000",
      fillOpacity: 0,
    },
  });
  /** 初始标签 */
  private _initialLabel = new Rect({
    silent: true,
    globalScaleRatio: 0,
    z: 100,
    scaleY: -1,
    shape: {
      x: -34,
      y: -35,
      width: 68,
      height: 23,
    },
    style: {
      stroke: new LinearGradient(0, 0, 0, 1, [
        {
          color: "#0000CC",
          offset: 0,
        },
        {
          color: "#6600FF",
          offset: 1,
        },
      ]),
      fill: "#070B09",
      fillOpacity: 0.9,
    },
    textContent: new Text({
      zlevel: 2,
      z: 101,
      style: {
        text: "双击完成",
        fill: "#DAFFEF",
      },
    }),
    textConfig: {
      position: "inside",
    },
  });
  private _handler?: {
    shape: Group;
    resolve: (value: unknown) => void;
  };
  /** 当前鼠标的位置 */
  private _currentMousePos: [number, number] = [-999999, -9999999];

  constructor(name: string, option?: Partial<RouteProfileOptions>) {
    super(name);
    Object.assign(this._option, option);
    // 鼠标在画布上移动
    this._container.onmousemove = (e: any) => {
      if (this._map && this._handler) {
        this._currentMousePos = this._map.root.transformCoordToLocal(
          e.offsetX,
          e.offsetY
        ) as [number, number];
        this._initialLabel.attr({
          x: this._currentMousePos[0],
          y: this._currentMousePos[1],
        });
        const polyline = this._handler.shape.childAt(0) as Polyline;
        const points = this._handler.shape.childAt(1) as Group;
        const distances = this._handler.shape.childAt(2) as Group;
        const count = points.childCount();
        polyline.dirty();
        polyline.shape.points[count] = this._currentMousePos;
        if (count > 0) {
          const image = (points.childAt(count - 1) as Group).childAt(
            2
          ) as Image;
          const pointPrev =
            polyline.shape.points[polyline.shape.points.length - 2];
          const pointNext =
            polyline.shape.points[polyline.shape.points.length - 1];
          const dx = pointPrev[0] - pointNext[0];
          const dy = pointNext[1] - pointPrev[1];
          const rotation = Math.atan2(dx, dy);
          image.attr({
            rotation,
          });

          const distance = distances.childAt(count - 1) as Text;
          distance.attr({
            x: (pointPrev[0] + pointNext[0]) / 2,
            y: (pointPrev[1] + pointNext[1]) / 2,
            style: {
              text: `${Math.round(Math.sqrt(dx * dx + dy * dy) / 1000)}km`,
            },
          });
        }
      }
    };
    // 鼠标点击画布
    this._container.onclick = () => {
      if (this._map && this._handler) {
        const polyline = this._handler.shape.childAt(0) as Polyline;
        polyline.shape.points.push(this._currentMousePos);

        const points = this._handler.shape.childAt(1) as Group;
        const count = points.childCount();
        const point = new Group({
          globalScaleRatio: 0,
          scaleY: -1,
          x: this._currentMousePos[0],
          y: this._currentMousePos[1],
        });
        point.add(
          new Circle({
            zlevel: 2,
            z: 10,
            shape: {
              r: 2,
            },
            style: {
              fill: "#5EFFFF",
            },
          })
        );
        if (count) {
          point.add(
            new Text({
              zlevel: 2,
              y: 10,
              style: {
                text: count.toString(),
                align: "center",
                padding: [2, 6],
                fill: " #ffffff",
                backgroundColor: "#23484E",
              },
            })
          );
        } else {
          point.add(
            new Text({
              zlevel: 2,
              y: 10,
              style: {
                text: "S",
                align: "center",
                padding: [2, 6],
                fill: " #ffffff",
                backgroundColor: "#23484E",
              },
            })
          );
        }
        point.add(
          new Image({
            zlevel: 2,
            y: -15,
            style: {
              x: -6,
              y: -6.5,
              image: airplane,
              width: 12,
              height: 13,
            },
          })
        );
        points.add(point);

        const distances = this._handler.shape.childAt(2) as Group;
        const pointNext =
          polyline.shape.points[polyline.shape.points.length - 1];
        distances.add(
          new Text({
            globalScaleRatio: 0,
            scaleY: -1,
            zlevel: 2,
            z: 50,
            x: pointNext[0],
            y: pointNext[1],
            style: {
              text: "0km",
              fill: "#143F2D",
              padding: [2, 6],
              backgroundColor: "#6CF8AC",
              borderRadius: 2,
              verticalAlign: "middle",
              align: "center",
            },
          })
        );
      }
    };
    this._container.ondblclick = () => {
      // 鼠标双击屏幕
      if (this._map && this._handler) {
        this.root.remove(this._container);
        this.root.remove(this._initialLabel);
        const polyline = this._handler.shape.childAt(0) as Polyline;
        polyline.shape.points.pop();
        polyline.shape.points.pop();
        polyline.dirty();
        const points = this._handler.shape.childAt(1) as Group;
        const count = points.childCount();
        points.remove(points.childAt(count - 1));
        ((points.childAt(count - 2) as Group).childAt(1) as Text).attr({
          style: {
            text: "E",
          },
        });
        const distances = this._handler.shape.childAt(2) as Group;
        distances.remove(distances.childAt(count - 2));
        distances.remove(distances.childAt(count - 2));

        this._handler.resolve(polyline.shape.points);
        this._handler = undefined;
      }
    };
  }

  /** 设置画布大小 */
  private _setContainerSize() {
    const map = this._map!;
    const size = map.size;
    const startPoint = [
      -map.root.x / map.root.scaleX,
      -map.root.y / map.root.scaleY,
    ];
    this._container.attr({
      x: startPoint[0],
      y: startPoint[1],
      shape: {
        width: size.x / map.root.scaleX,
        height: size.y / map.root.scaleY,
      },
    });
    // this._initialLabel.attr({
    //   x: startPoint[0],
    //   y: startPoint[1],
    // });
  }
  onZoomEnd() {
    this._setContainerSize();
  }
  onMoveEnd() {
    this._setContainerSize();
  }
  /** 开启绘制航线 */
  async drawProfile() {
    if (this._map && !this._handler) {
      this.root.removeAll();
      this.root.add(this._container);
      this.root.add(this._initialLabel);
      return new Promise((resolve) => {
        this._handler = {
          shape: new Group({
            silent: true,
          }),
          resolve,
        };

        // 添加折线集合
        this._handler.shape.add(
          new Polyline({
            silent: true,
            zlevel: 2,
            shape: {
              points: [],
            },
            style: {
              strokeNoScale: true,
              lineWidth: 1,
              lineDash: "dashed",
              stroke: "#4DFFBF",
            },
          })
        );

        // 添加点集
        this._handler.shape.add(new Group());
        // 添加距离显示
        this._handler.shape.add(new Group());
        this.root.add(this._handler.shape);
      });
    }
  }
}
