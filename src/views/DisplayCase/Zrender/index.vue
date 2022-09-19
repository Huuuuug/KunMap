<template>
  <div class="container">
    <div class="map" ref="refMap"></div>
    <div class="btn" @click="start">开始绘制</div>
  </div>
</template>

<script lang="ts" setup>
import { RouteProfile } from "@/common/KunMap";
import { KunMap } from "@/common/KunMap";
import { onMounted, ref } from "vue";
let map: KunMap;
let routeProfile: RouteProfile;

const refMap = ref<HTMLDivElement | null>();

async function start() {
  const res = await routeProfile.drawProfile();
}
onMounted(async () => {
  map = new KunMap(refMap.value!, {
    center: [120, 30],
    zoom: 6,
    backgroundColor: "#0F3965",
  });
  (window as any).map = map;
  routeProfile = new RouteProfile("线路").addTo(map);
});
</script>
<style lang="less" scoped>
.container {
  width: 100%;
  height: 100%;
  position: relative;
  .map {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
  .btn {
    position: absolute;
    right: 40px;
    top: 40px;
    cursor: pointer;
    background-color: #6cf8ac;
    color: rgb(4, 2, 59);
    padding: 10px 15px;
    border-radius: 5px;
  }
}
</style>
