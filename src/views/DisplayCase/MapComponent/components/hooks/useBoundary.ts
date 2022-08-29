import HangZhouMunicipal from "@/assets/geojson/hangzhou.json";
import HangZhouCounty from "@/assets/geojson/hangzhouCounty.json";
import ShanTou from "@/assets/geojson/shantou.json";

import { GeoJSON } from "leaflet";

export const useBoundary = () => {
  /** 市界 */
  const municipalBoundary = new GeoJSON(HangZhouMunicipal, {
    style: {
      color: "#003399",
      fillOpacity: 0,
    },
  });
  /** 县区界 */
  const countyBoundary = new GeoJSON(HangZhouCounty, {
    style: {
      color: "#ff0000",
      fillOpacity: 0,
    },
  });
  /** 汕头市边界 */
  const shantou = new GeoJSON(ShanTou, {
    style: {
      color: "#242424",
      fillOpacity: 0,
    },
  });
  return {
    municipalBoundary,
    countyBoundary,
    shantou,
  };
};
