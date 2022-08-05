<template>
  <div class="map" ref="refMap"></div>
  <MapControl :get-map="getMap"></MapControl>
</template>

<script lang="ts" setup>
import "leaflet/dist/leaflet.css";
import { Map } from "leaflet";
import { nextTick, onMounted, Ref, ref } from "vue";
import MapControl from "./components/MapControl/MapControl.vue";

const refMap: Ref<HTMLDivElement | null> = ref(null);
let map: Map;

/** 获取地图实例 */
const getMap = (): Promise<Map> => {
  return new Promise((resolve) => {
    if (map) {
      resolve(map);
    } else {
      nextTick(() => {
        resolve(map);
      });
    }
  });
};

onMounted(() => {
  map = new Map(refMap.value!, {
    center: [29.900186637177384, 119.53674316406251],
    zoom: 9,
    minZoom: 3,
    maxZoom: 18,
    zoomControl: false,
    attributionControl: false,
  });
  (window as any).map = map;
});
</script>
<style lang="less" scoped>
.map {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
