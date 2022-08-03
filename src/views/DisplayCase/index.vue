<template>
  <div class="display-case">
    <ClassificationStatisticalFigure :datas="classifyDatas" :max="max" />
  </div>
</template>

<script lang="ts" setup>
import ClassificationStatisticalFigure from "@/components/ClassificationStatisticalFigure/index.vue";
import { onBeforeMount, ref } from "vue";
import useClassificationStatistical, {
  ClassifyData,
} from "./hooks/useClassificationStatistical";

const { randomlyGenerateClassifyDatas } = useClassificationStatistical();

/** 生成数据数量 */
const num = ref<number>(6);
/** 可输入最大值 */
const max = ref<number>(500);
/** 分类数据 */
const classifyDatas = ref<ClassifyData[]>([]);
onBeforeMount(() => {
  classifyDatas.value = randomlyGenerateClassifyDatas(num.value);
});
</script>

<style lang="less" scoped>
.display-case {
  width: 100%;
  height: 100%;
}
</style>
