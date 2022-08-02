<template>
  <div class="container" ref="refZr"></div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref, Ref } from "vue";
import { ZRenderType, init, Group } from "zrender";
import useCreatFigure from "./hooks/useCreatFigure";

const refZr: Ref<HTMLDivElement | null> = ref(null);

/** 绘制雷达图 */
const draw = () => {
  root.removeAll();
  console.log(root);

  const r = root.y;
};
let zr: ZRenderType;
/** 根节点 */
let root: Group;
const { createRoot } = useCreatFigure();
onMounted(() => {
  nextTick(() => {
    zr = init(refZr.value);
    // root = createRoot(refZr.value!.offsetWidth, refZr.value!.offsetHeight);
    // draw();
  });
});
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
