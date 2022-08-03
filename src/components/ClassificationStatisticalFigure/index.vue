<template>
  <div class="container" ref="refZr"></div>
</template>

<script lang="ts" setup>
import { onBeforeMount, onMounted, ref, Ref, defineProps } from "vue";
import { ZRenderType, init, Group } from "zrender";
import useCreatFigure from "./hooks/useCreatFigure";
import { ClassifyData } from "@/views/DisplayCase/hooks/useClassificationStatistical";

const props = defineProps<{
  datas: ClassifyData[];
  max: number;
}>();

const { createRoot, createBackgroud, getDataPosition, createCable } =
  useCreatFigure();
const refZr: Ref<HTMLDivElement | null> = ref(null);
/** 绘制雷达图 */
const draw = () => {
  root.removeAll();
  const r = root.y - 50;
  root.add(createBackgroud(r));
  const { datas, labels } = getDataPosition(
    props.datas.map((e) => e.value),
    props.max,
    r
  );
  root.add(
    createCable(
      datas,
      props.datas.map((e) => e.color)
    )
  );
};
let zr: ZRenderType;
/** 根节点 */
let root: Group;
onMounted(() => {
  zr = init(refZr.value);
  root = createRoot(refZr.value!.offsetWidth, refZr.value!.offsetHeight);
  draw();
  zr.add(root);
});
onBeforeMount(() => {
  // zr.dispose();
});
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
}
</style>
