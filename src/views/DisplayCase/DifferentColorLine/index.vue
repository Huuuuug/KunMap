<template>
  <div class="map" ref="refMap"></div>
</template>

<script lang="ts" setup>
import { KunMap } from "@/common/KunMap/index";
import { onMounted, ref } from "vue";
import { Boundary, Grid, Points } from "@/common/KunMap";
import zhengzhou from "@/assets/geojson/zhengzhouCommunity.json";
import png from "@/assets/imgs/test.png";
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
  // const boundary = new Boundary("杭州").addTo(map);
  // boundary.setBoundaryByGeoJosn(zhengzhou);
  // const grid = new Grid("格点").addTo(map);
  // grid.setGridByPNG(png);

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
  (window as any).points = points;
});
</script>
<style lang="less" scoped>
.map {
  width: 100%;
  height: 100%;
}
</style>
