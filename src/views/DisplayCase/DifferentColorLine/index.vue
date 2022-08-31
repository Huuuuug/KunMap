<template>
  <div class="map" ref="refMap"></div>
</template>

<script lang="ts" setup>
import { KunMap } from "@/common/KunMap/index";
import { onMounted, ref } from "vue";
import { Boundary, Grid, Points, EquivalentLine } from "@/common/KunMap";
import zhengzhou from "@/assets/geojson/zhengzhouCommunity.json";
import Line from "@/assets/geojson/line.json";
import png from "@/assets/imgs/rain.png";
import { Circle } from "zrender";
let map: KunMap;

const refMap = ref<HTMLDivElement | null>();
onMounted(() => {
  map = new KunMap(refMap.value!, {
    center: [113.46553785906676, 34.65348124738536],
    zoom: 10,
    minZoomLevel: 3,
    maxZoomLevel: 18,
    backgroundColor: "#eee",
  });
  (window as any).map = map;
  const boundary = new Boundary("杭州").addTo(map);
  boundary.setBoundaryByGeoJosn(zhengzhou);
  const grid = new Grid("格点").addTo(map);
  grid.setGridByPNG(png);

  const points = new Points("点").addTo(map);
  points.add([
    {
      lon: 113.46553785906676,
      lat: 34.65348124738536,
      keys: ["绿点"],
      color: "#339900",
      shape: new Circle({
        z: 10,
        globalScaleRatio: 0,
        shape: {
          r: 10,
        },
        style: {
          fill: "#0000FF",
        },
      }),
      priority: 10,
    },
    {
      lon: 113.47893785906676,
      lat: 34.65348124738536,
      keys: ["红点"],
      priority: 9,
    },
    {
      lon: 113.57893785906676,
      lat: 34.65348124738536,
      keys: ["蓝点"],
      color: "#0099FF",
      priority: 8,
    },
  ]);

  /********************* 等值线 ********************* */
  const legend: [number, string][] = [
    [0.09, "#d4d5d4"],
    [5, "#a5f38d"],
    [10, "#3db93f"],
    [15, "#00ecec"],
    [20, "#01a0f6"],
    [25, "#0d41f9"],
    [30, "#ffff00"],
    [35, "#e7c000"],
    [40, "#ff9000"],
    [45, "#ff0000"],
    [50, "#c00000"],
    [60, "#ff00f0"],
    [70, "#780084"],
    [80, "#ad92f7"],
  ];
  const equivalentLine = new EquivalentLine("等值线", { grid, legend }).addTo(
    map
  );
  equivalentLine.drawLineByGeoJson(Line);
  // setTimeout(() => {
  // }, 1);
});
</script>
<style lang="less" scoped>
.map {
  width: 100%;
  height: 100%;
}
</style>
