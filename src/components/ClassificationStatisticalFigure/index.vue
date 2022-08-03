<template>
  <div class="control-box"></div>
  <div class="container" ref="refZr"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref, defineProps, onBeforeUnmount } from "vue";
import { ZRenderType, init, Group } from "zrender";
import useCreatFigure from "./hooks/useCreatFigure";
import { ClassifyData } from "@/views/DisplayCase/hooks/useClassificationStatistical";

const props = defineProps<{
  datas: ClassifyData[];
  max: number;
}>();

const { createRoot, createBackgroud, getDataPosition, createCable, createLabel } = useCreatFigure();
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
  root.add(
    createLabel(
      labels,
      props.datas.map((e) => e.name)
    )
  );
};
let zr: ZRenderType;
/** 根节点 */
let root: Group;

const resize = () => {
  zr.resize();
  zr.clear();
  root = createRoot(refZr.value!.offsetWidth, refZr.value!.offsetHeight);
  draw();
  zr.add(root);
};

onMounted(() => {
  zr = init(refZr.value);
  root = createRoot(refZr.value!.offsetWidth, refZr.value!.offsetHeight);
  draw();
  zr.add(root);
  window.addEventListener("resize", resize);
});
onBeforeUnmount(() => {
  zr.dispose();
  window.removeEventListener("resize", resize);
});
</script>

<style lang="less" scoped>
.control-box {
  position: absolute;
  top: 0;
  right: 0;
}
.container {
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
}
</style>
