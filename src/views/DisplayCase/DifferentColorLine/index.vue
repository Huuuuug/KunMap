<template>
  <div class="map" ref="refMap"></div>
</template>

<script lang="ts" setup>
import { KunMap } from "@/common/KunMap/index";
import { onMounted, ref } from "vue";
import { Boundary } from "@/common/KunMap";
import Hangzhou from "@/assets/geojson/hangzhou.json";
import zhengzhou from "@/assets/geojson/zhengzhouCommunity.json";
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
});
</script>
<style lang="less" scoped>
.map {
  width: 100%;
  height: 100%;
}
</style>
