import { BasicElement } from "../BasicElement";
import { GeoJSON } from "geojson";
import { CompoundPath, Path, PathProps, Polyline } from "zrender";
import { Projection } from "../utils/Projection";
import Eventful from "zrender/lib/core/Eventful";

export interface BoundaryOption {
  minZoomLevel: number;
  maxZoomLevel: number;
  /** Boundary宽度 */
  lineWidth: number;
  /** Boundary颜色 */
  lineColor: string;
  /** Boundary的层级 */
  z?: number;
}

export class Boundary extends BasicElement {
  // event = new Eventful<{
  //   change: () => void;
  // }>();
  private _option: BoundaryOption = {
    minZoomLevel: 0,
    maxZoomLevel: 18,
    lineWidth: 2,
    lineColor: "#ff0000",
    z: 50,
  };
  /** 边界宽度 */
  private _lineWidths: number[] = [];
  get lineWidths() {
    return this._lineWidths;
  }
  get bbox() {
    const rect = this.root.getBoundingRect();
    return {
      east: Projection.xToLon(rect.x + rect.width),
      west: Projection.xToLon(rect.x),
      south: Projection.yToLat(rect.y),
      north: Projection.yToLat(rect.y + rect.height),
    };
  }
  get paths() {
    const res: Path<PathProps>[] = [];
    this.root.eachChild((e) => {
      const path = e as CompoundPath;
      res.push(...path.shape.paths);
    });
    return res;
  }
  /**
   * 边界
   * @param name 名称
   * @param option 配置
   */
  constructor(name: string, option?: Partial<BoundaryOption>) {
    super(name);
    Object.assign(this._option, option);
  }
  /**
   * 通过json文件设置边界
   * @param geo
   */
  setBoundaryByGeoJosn(geo: GeoJSON) {
    this.root.removeAll();
    this._lineWidths = [];
    switch (geo.type) {
      case "FeatureCollection":
        geo.features.map((feature) => {
          const paths: Polyline[] = [];
          const compoundPath = new CompoundPath({
            z: this._option.z,
            silent: true,
            shape: {
              path: [],
            },
            style: {
              fill: "none",
              lineWidth: this._option.lineWidth,
              stroke: this._option.lineColor,
            },
          });
          switch (feature.geometry.type) {
            case "MultiPolygon":
              feature.geometry.coordinates.forEach((lines) => {
                lines.forEach((line) => {
                  paths.push(
                    new Polyline({
                      shape: {
                        points: line.map((point) => [
                          Projection.lonToX(point[0]),
                          Projection.latToY(point[1]),
                        ]),
                      },
                    })
                  );
                });
              });
              break;
            case "Polygon":
              feature.geometry.coordinates.forEach((line) => {
                paths.push(
                  new Polyline({
                    shape: {
                      points: line.map((point) => [
                        Projection.lonToX(point[0]),
                        Projection.latToY(point[1]),
                      ]),
                    },
                  })
                );
              });
              break;
            default:
              throw new Error(`TODO ${feature.geometry.type} 待完成`);
          }
          compoundPath.attr({
            shape: {
              paths,
            },
          });
          this._lineWidths.push(compoundPath.style.lineWidth || 0);

          this.root.add(compoundPath);
        });
        break;
      default:
        throw new Error(`TODO ${geo.type} 待完成`);
    }
    if (this._map) this.onZoomEnd();
    // this.event.trigger("change");
    return this;
  }
  onZoomEnd() {
    const zoom = this._map!.zoom;
    if (zoom < this._option.minZoomLevel || zoom > this._option.maxZoomLevel) {
      this.root.eachChild((e) => {
        const path = e as CompoundPath;
        path.hide();
      });
    } else {
      this.root.eachChild((e, i) => {
        const path = e as CompoundPath;
        console.log(path.style.lineWidth);
        path.show();
        path.attr({
          style: {
            lineWidth: this._lineWidths[i!] / this._map!.root.scaleX,
          },
        });
      });
    }
  }
}
