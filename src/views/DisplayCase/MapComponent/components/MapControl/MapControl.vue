<template>
  <div
    class="map-control"
    @mouseenter="isMouseIn = true"
    @mouseleave="isMouseIn = false"
  >
    <img
      v-for="(img, ind) in mapTypeImgs"
      v-show="currentActiveMap === ind || isMouseIn"
      :key="ind"
      :src="img.icon"
      class="map-icon"
      :class="{ active: currentActiveMap === ind }"
      @click="
        currentActiveMap = ind;
        setCurrentMap(ind);
      "
    />
  </div>
</template>
<script setup lang="ts">
import { ref, defineProps, onMounted } from "vue";
import img from "../../assets/imgs/img.jpg";
import ter from "../../assets/imgs/ter.jpg";
import vec from "../../assets/imgs/vec.png";
import { TianDiTu } from "../../utils/generateTianDiTu";
import { Map } from "leaflet";
import { useBoundary } from "../hooks/useBoundary";

const props = defineProps<{
  getMap: () => Promise<Map>;
}>();
/** 天地图实例 */
let tianDiTu: TianDiTu;
const mapTypeImgs = [
  { icon: vec, keys: ["vec_w", "cva_w"] },
  { icon: img, keys: ["img_w", "cia_w"] },
  { icon: ter, keys: ["ter_w", "cta_w"] },
];

/** 鼠标是否移入 */
const isMouseIn = ref(false);
/** 当前激活的底图类型 */
const currentActiveMap = ref(0);

/** 设置当前激活的底图 */
const setCurrentMap = (ind: number) => {
  tianDiTu.theme = ind;
};

const { municipalBoundary, countyBoundary } = useBoundary();
onMounted(() => {
  props.getMap().then((map) => {
    tianDiTu = new TianDiTu(map, { theme: 0 });
    countyBoundary.addTo(map);
    municipalBoundary.addTo(map);
  });
});
</script>
<style lang="less" scoped>
.map-control {
  position: absolute;
  right: 20px;
  top: 20px;
  z-index: 1000;
  .map-icon {
    width: 50px;
    height: 50px;
    border: 2px solid #fff;
    margin: 0 5px;
    cursor: pointer;
    border-radius: 50%;
  }
  .active {
    border: 2px solid blue;
  }
}
</style>
