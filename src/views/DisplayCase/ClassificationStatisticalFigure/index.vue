<template>
  <div class="classification-statistical">
    <div class="loop-box" v-if="currentLoopData">
      <div
        class="color-label"
        :style="{ backgroundColor: currentLoopData.color }"
      ></div>
      <div class="label">{{ currentLoopData.name }}</div>
      <div class="value">数量：{{ currentLoopData.value }} 个</div>
    </div>
    <div class="control-box">
      <div class="row">
        <Slider
          :max="50"
          :min="0"
          label="测试数据数量"
          unit="条"
          v-model="num"
        ></Slider>
      </div>
      <div class="row">
        <Slider :max="500" :min="0" label="最大值" v-model="max"></Slider>
      </div>
      <button
        class="switch-button"
        :class="[{ 'is-checked': isButtonChecked }]"
        @click="onSwitchClick"
        @mousedown="isButtonChecked = true"
        @mouseup="isButtonChecked = false"
      >
        切换数据
      </button>
    </div>
    <div class="container" ref="refZr"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref, onBeforeUnmount } from "vue";
import { ZRenderType, init, Group } from "zrender";
import Slider from "@/common/Slider/index.vue";
import useCreatFigure from "./hooks/useCreatFigure";
import useClassifyDatas, { ClassifyData } from "./hooks/useClassifyDatas";

const isButtonChecked = ref<boolean>(false);

/************************* 生成数据 ************************** */
const { randomlyGenerateClassifyDatas } = useClassifyDatas();

/** 生成数据数量 */
const num = ref<number>(8);
/** 数据value最大值 */
const max = ref<number>(200);
/** 测试数据 */
let testDatas: ClassifyData[] = randomlyGenerateClassifyDatas(
  num.value,
  max.value
);
/** 重新生成测试数据 */
const onSwitchClick = () => {
  testDatas = randomlyGenerateClassifyDatas(num.value, max.value);
  draw();
};
/************************* 轮换提示框功能 ************************** */

/** 当前轮换的对象 */
const currentLoopData = ref<ClassifyData | null>(testDatas[0]);
/** 轮换定时器 */
let timer: any;

/** 开始轮换 */
const play = () => {
  const index = testDatas.findIndex(
    (v) => v.name === currentLoopData.value!.name
  );
  currentLoopData.value = testDatas[(index + 1) % testDatas.length];
  timer = setTimeout(play, 3000);
};

/************************* 生成数据图 ************************** */
const {
  createRoot,
  createBackgroud,
  getDataPosition,
  createCable,
  createLabel,
} = useCreatFigure();
const refZr: Ref<HTMLDivElement | null> = ref(null);
/** 绘制雷达图 */
const draw = () => {
  root.removeAll();
  const r = root.y - 50;
  root.add(createBackgroud(r));
  const { datas, labels } = getDataPosition(
    testDatas.map((e) => e.value),
    max.value,
    r
  );
  root.add(
    createCable(
      datas,
      testDatas.map((e) => e.color),
      (i) => {
        clearTimeout(timer);
        currentLoopData.value = testDatas[i];
      },
      () => {
        timer = setTimeout(play, 3000);
      }
    )
  );
  root.add(
    createLabel(
      labels,
      testDatas.map((e) => e.name)
    )
  );
};
let zr: ZRenderType;
/** 根节点 */
let root: Group;

/** 屏幕尺寸改变，重新绘制 */
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
  play();
  window.addEventListener("resize", resize);
});
onBeforeUnmount(() => {
  zr.dispose();
  clearTimeout(timer);
  window.removeEventListener("resize", resize);
});
</script>

<style lang="less" scoped>
.classification-statistical {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-end;

  .loop-box {
    position: absolute;
    width: 100px;
    height: 70px;
    top: 50px;
    left: 25%;
    display: flex;
    flex-direction: column;
    background-color: #396954;
    border-radius: 4px;
    padding: 5px;
    color: #fff;
    .color-label {
      width: 100px;
      height: 20px;
      border-radius: 4px;
    }
    .label {
      margin-top: 10px;
    }
    .value {
      margin-top: 5px;
    }
  }
  .control-box {
    position: absolute;
    top: 50px;
    right: 50px;
    z-index: 1;
    .row {
      display: flex;
      align-items: center;
      margin-top: 10px;
    }
    .row:first-child {
      margin: 0;
    }
    .switch-button {
      margin-top: 10px;
      width: 100px;
      height: 30px;
      background-color: #396954;
      color: #fff;
      border-radius: 4px;
      transition: all 0.5s;
      border: 1px solid #1a3e2f;
      cursor: pointer;
    }
    .is-checked {
      background-color: rgb(30, 86, 68);
    }
  }
  .container {
    width: 100%;
    height: 100%;
    background-color: #f0f0f0;
  }
}
</style>
