import HangZhouMunicipal from "@/assets/geojson/hangzhou.json";

import { GeoJSON } from "leaflet";

export const useBoundary = () => {
  /** 市界 */
  const municipalBoundary = new GeoJSON(HangZhouMunicipal, {
    style: {
      color: "#aac6ee",
      weight: 1,
    },
  });
  return {
    municipalBoundary,
  };
};
