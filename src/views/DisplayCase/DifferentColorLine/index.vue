<template>
  <div class="map" ref="refMap"></div>
</template>

<script lang="ts" setup>
import { KunMap } from "@/common/KunMap/index";
import { onMounted, ref } from "vue";
let map: KunMap;

const refMap = ref<HTMLDivElement | null>();
onMounted(() => {
  map = new KunMap(refMap.value!, {
    center: [29.900186637177384, 119.53674316406251],
    zoom: 9,
    minZoomLevel: 3,
    maxZoomLevel: 18,
    backgroundColor: "#F0F0F0",
  });
});
</script>
<style lang="less" scoped>
.map {
  width: 100%;
  height: 100%;
}
</style>
