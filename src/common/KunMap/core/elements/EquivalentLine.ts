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
  private _linePath: Map<string, CompoundPath> = new Map();
  /**
   * 处理线路
   * @param line
   * @param relevance 线宽与地图缩放映射关系
   */
  private _dealLine(line: Position[], relevance: GeoJsonProperties) {
    const { grid, legend } = this._option;
    setTimeout(() => {
      grid.getGridValue([1, 2]);
    }, 10);

    // console.log(line, relevance);
    line.forEach((point: number[]) => {
      const x = Projection.lonToX(point[0]);
      const y = Projection.latToY(point[1]);
    });
  }
  constructor(name: string, option: EquivalentLineOption) {
    super(name);
    this._option = option;
  }
  /** 绘制等值线 */
  drawLineByGeoJson(geojson: GeoJSON) {
    this._geojson = geojson;
    this.root.removeAll();
    if (geojson.type === "FeatureCollection") {
      geojson.features.forEach((e: Feature) => {
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
}
