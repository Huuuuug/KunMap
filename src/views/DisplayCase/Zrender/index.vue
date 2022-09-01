<template>
  <div class="map" ref="refMap"></div>
</template>

<script lang="ts" setup>
import { RouteProfile } from "@/common/KunMap";
import { KunMap } from "@/common/KunMap";
import { onMounted, ref } from "vue";
let map: KunMap;

const refMap = ref<HTMLDivElement | null>();
onMounted(() => {
  map = new KunMap(refMap.value!, {
    center: [120, 30],
    zoom: 6,
    backgroundColor: "#0F3965",
  });
  (window as any).map = map;
  const routeProfile = new RouteProfile("线路").addTo(map);
  routeProfile.drawProfile();
});
</script>
<style lang="less" scoped>
.map {
  width: 100%;
  height: 100%;
}
</style>
