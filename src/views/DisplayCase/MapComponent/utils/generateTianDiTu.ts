import { Map, tileLayer, TileLayer } from "leaflet";
export enum TianDiTuTheme {
  /** 行政区划 */
  vector,
  /** 遥感影像 */
  image,
  /** 地形 */
  terrain,
}

export interface TianDiTuOption {
  /** 天地图密钥 */
  key: string;
  /** 主题，默认TianDiTuTheme.image */
  theme: TianDiTuTheme;
  /** 是否显示底图，默认true */
  showBasic: boolean;
  /** 是否显示标注，默认true */
  showMark: boolean;
}

const list = [
  ["vec_w", "cva_w"],
  ["img_w", "cia_w"],
  ["ter_w", "cta_w"],
];

function getUrl(type: string, key: string) {
  return `http://t{s}.tianditu.gov.cn/DataServer?T=${type}&X={x}&Y={y}&L={z}&tk=${key}`;
}

export class TianDiTu {
  /** leaflet地图实例 */
  readonly map: Map;
  private _layers: TileLayer[];
  private _option: TianDiTuOption = {
    key: "0a9cfb135e61b353ba6c8b4cb3386101",
    theme: TianDiTuTheme.image,
    showBasic: true,
    showMark: true,
  };

  constructor(map: Map, option?: Partial<TianDiTuOption>) {
    this.map = map;
    Object.assign(this._option, option);
    if (list[this.theme]) {
      this._layers = [
        tileLayer(getUrl(list[this.theme][0], this._option.key), {
          subdomains: "01234567",
        }),
        tileLayer(getUrl(list[this.theme][1], this._option.key), {
          subdomains: "01234567",
          pane: "shadowPane",
        }),
      ];
    } else {
      this._layers = [
        tileLayer("", {
          subdomains: "01234567",
        }),
        tileLayer("", {
          subdomains: "01234567",
          pane: "shadowPane",
        }),
      ];
    }

    if (this.showBasic) {
      this._layers[0].addTo(this.map);
    }
    if (this.showMark) {
      this._layers[1].addTo(this.map);
    }
  }
  /** 天地图主题 */
  get theme() {
    return this._option.theme;
  }
  set theme(val) {
    if (this._option.theme != val) {
      this._option.theme = val;
      this._layers.forEach((l, i) => {
        if (list[this.theme]) {
          l.setUrl(getUrl(list[this.theme][i], this._option.key));
        } else {
          l.setUrl("");
        }
      });
    }
  }

  /** 是否显示底图 */
  get showBasic() {
    return this._option.showBasic;
  }
  set showBasic(val) {
    if (this._option.showBasic != val) {
      this._option.showBasic = val;
      if (val) {
        this._layers[0].addTo(this.map);
      } else {
        this._layers[0].remove();
      }
    }
  }

  /** 是否显示标注 */
  get showMark() {
    return this._option.showMark;
  }
  set showMark(val) {
    if (this._option.showMark != val) {
      this._option.showMark = val;
      if (val) {
        this._layers[1].addTo(this.map);
      } else {
        this._layers[1].remove();
      }
    }
  }
}
