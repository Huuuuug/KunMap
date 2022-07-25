<template>
  <div class="map" ref="refMap"></div>
  <MapControl></MapControl>
</template>

<script lang="ts" setup>
import "leaflet/dist/leaflet.css";
import { Map } from "leaflet";
import { onMounted, Ref, ref } from "vue";
import { TianDiTu } from "./utils/generateTianDiTu";
import MapControl from './components/MapControl.vue'

const refMap:Ref<HTMLDivElement | null> = ref(null);
let map: Map;

onMounted(() => {
  map = new Map(refMap.value!,{
    center: [36.89162823274357, 102.3088864887121],
    zoom: 4,
    minZoom: 3,
    maxZoom: 18,
    zoomControl: false,
    attributionControl: false,
  });
  new TianDiTu(map)
});
</script>
<style lang="less" scoped>
.map {
  width: 100vw;
  height: 100vh;
  position: relative;
}
</style>
