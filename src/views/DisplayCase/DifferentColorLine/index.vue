<template>
  <div class="map" ref="refMap"></div>
</template>

<script lang="ts" setup>
import { KunMap } from "@/common/KunMap/index";
import { onMounted, ref } from "vue";
import { Boundary, Grid, Points } from "@/common/KunMap";
import zhengzhou from "@/assets/geojson/zhengzhouCommunity.json";
import png from "@/assets/imgs/test.png";
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

  const point = [
    { lon: 113.46553785906676, lat: 34.65348124738536 },
    { lon: 113.64553785906676, lat: 34.75348124738536 },
  ];
  const points = new Points("点").addTo(map);
  points.add([
    { lon: 113.46553785906676, lat: 34.65348124738536, keys: ["红点"] },
    {
      lon: 113.64553785906676,
      lat: 34.75348124738536,
      keys: ["绿点"],
      color: "#339900",
    },
  ]);
  (window as any).points = points;
  points.hidePoints("红点");
});
</script>
<style lang="less" scoped>
.map {
  width: 100%;
  height: 100%;
}
</style>
