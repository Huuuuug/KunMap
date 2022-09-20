import { CompoundPath, Polyline } from "zrender";
import { BasicElement } from "../BasicElement";
import { Grid } from "./Grid";
import { GeoJSON, Feature, GeoJsonProperties, Position } from "geojson";
import { Projection } from "../utils/Projection";

export interface EquivalentLineOption {
  grid: Grid;
  legend: [number, string][];
}

export class EquivalentLine extends BasicElement {
  private _option: EquivalentLineOption;
  private _geojson: any;
  /** 线宽与地图缩放大小映射 */
  private _width_zoom: Map<number, number> = new Map();
  private _linePath: Map<string, CompoundPath> = new Map();
  /**
   * 处理线路
   * @param line
   * @param relevance 线宽与地图缩放映射关系
   */
  private _dealLine(line: Position[], relevance: GeoJsonProperties) {
    const { grid, legend } = this._option;
    const garbage: number[][] = [];
    let before = {
      key: "",
      points: garbage,
    };
    line.forEach((point: number[]) => {
      const x = Projection.lonToX(point[0]);
      const y = Projection.latToY(point[1]);
      const gridValue = grid.getGridValue([point[0], point[1]]);
      let color = "";
      if (typeof gridValue === "number") {
        for (let i = legend.length - 1; i >= 0; i--) {
          if (gridValue >= legend[i][0]) {
            color = legend[i][1];
            break;
          }
        }
      }
      const key = `${relevance!.width}-${color}`;
      before.points.push([x, y]);
      if (before.key !== key) {
        if (color) {
          const points: number[][] = [[x, y]];
          const temp = this._linePath.get(key);
          if (temp) {
            temp.shape.paths.push(
              new Polyline({
                shape: {
                  points,
                },
              })
            );
          } else {
            this._linePath.set(
              key,
              new CompoundPath({
                shape: {
                  paths: [
                    new Polyline({
                      shape: {
                        points,
                      },
                    }),
                  ],
                },
                style: {
                  strokeNoScale: true,
                  lineWidth: relevance!.width,
                  fill: "none",
                  stroke: color,
                },
              })
            );
          }
          before = {
            key,
            points,
          };
        } else {
          before = {
            key: "",
            points: garbage,
          };
        }
      }
    });
  }
  constructor(name: string, option: EquivalentLineOption) {
    super(name);
    this._option = option;
    this._option.grid.event.on("change", () => {
      this.drawLineByGeoJson(this._geojson);
    });
  }

  /** 绘制等值线 */
  drawLineByGeoJson(geojson?: GeoJSON) {
    this._geojson = geojson;
    this._linePath.clear();
    this._width_zoom.clear();
    this.root.removeAll();
    if (geojson) {
      if (geojson.type === "FeatureCollection") {
        geojson.features.forEach((e: Feature) => {
          // 记录线宽与地图缩放映射
          const w_zoom = this._width_zoom.get(e.properties!.width);
          if (!w_zoom) {
            this._width_zoom.set(e.properties!.width, e.properties!.zoom);
          }
          switch (e.geometry.type) {
            case "MultiLineString":
              e.geometry.coordinates.forEach((line: Position[]) => {
                this._dealLine(line, e.properties);
              });
              break;
            case "LineString":
              this._dealLine(e.geometry.coordinates, e.properties);
              break;
            default:
              throw new Error("geojson格式有误");
          }
        });
      }
    }

    this.onZoomEnd();
    // this.root.dirty();
    this._linePath.forEach((path: CompoundPath) => {
      this.root.add(path);
    });
  }

  onZoomEnd() {
    if (this._map && this._linePath) {
      const zoom = this._map.zoom;
      // 缩放筛选
      this._linePath.forEach((path: CompoundPath, key: string) => {
        const z_width = this._width_zoom.get(
          Number.parseFloat(key.split("-")[0])
        );

        if (z_width) {
          z_width > zoom ? path.hide() : path.show();
        }
      });
    }
  }
}
