<template>
  <div class="slider">
    <span class="label">{{ label }}:</span>
    <div class="container" @click="onMouseClick">
      <div class="highlight" ref="refPercent" :style="{ width: percent }">
        <div class="handler" @click.stop @mousedown="onMouseDown"></div>
      </div>
    </div>
    <div class="input-box">
      <input
        :min="Math.floor(min)"
        :max="Math.floor(max)"
        type="number"
        v-model="value"
        @change="onInputChange"
      />
      <div class="unit">{{ unit }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, computed, defineEmits, watch } from "vue";

const props = defineProps<{
  label: string;
  unit?: string;
  min: number;
  max: number;
  modelValue: number;
}>();

const emit = defineEmits(["update:modelValue"]);

const value = ref(Math.min(props.max, props.modelValue));
const unit = ref(props.unit);
watch(
  () => props.modelValue,
  (val) => {
    value.value = Math.floor(val);
  }
);

/** 当前值所占百分比 */
const percent = computed(() => {
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100 + "%";
});

/************************** 处理滑块滑动 **************************** */

/** 滑动条dom */
const refPercent = ref<HTMLDivElement | null>(null);

/** 鼠标点击进度条 */
const onMouseClick = (e: MouseEvent) => {
  const dom = refPercent.value!;
  const percent = e.offsetX / dom.parentElement!.offsetWidth;
  emit("update:modelValue", (props.max - props.min) * percent + props.min);
};

/** 鼠标滑动事件 */
const onMouseMove = (e: MouseEvent) => {
  if (e.movementX === 0) return;
  const dom = refPercent.value!;
  const percent = Math.max(
    0,
    Math.min(
      1,
      (dom.offsetWidth + e.movementX) / dom.parentElement!.offsetWidth
    )
  );
  emit("update:modelValue", (props.max - props.min) * percent + props.min);
};

/** 鼠标按下事件 */
const onMouseDown = () => {
  document.body.addEventListener("mousemove", onMouseMove);
  document.body.addEventListener(
    "mouseup",
    () => {
      document.body.removeEventListener("mousemove", onMouseMove);
    },
    { once: true }
  );
};

/** input框值改变 */
const onInputChange = () => {
  emit(
    "update:modelValue",
    Math.max(props.min, Math.min(props.max, value.value))
  );
};
</script>

<style lang="less" scoped>
.slider {
  display: flex;
  align-items: center;
  user-select: none;
  .label {
    font-weight: 700;
    margin-right: 8px;
    color: #396954;
  }
  .container {
    width: 95px;
    height: 4px;
    background-color: #396954;
    border-radius: 2px;
    cursor: pointer;
    .highlight {
      background: linear-gradient(
        270deg,
        #2edd94 -8.62%,
        rgba(46, 221, 148, 0) 100%
      );
      border-radius: 2px 0px 0px 2px;
      height: 100%;
      position: relative;
      .handler {
        width: 4px;
        height: 10px;
        background-color: #2edd94;
        border: 1px solid #ffffff;
        border-radius: 5px;
        position: absolute;
        top: 50%;
        right: 0;
        transform: translate(50%, -50%);
      }
    }
  }
  .input-box {
    margin-left: 8px;
    display: flex;
    align-items: center;
    input {
      width: 35px;
      background: #396954;
      outline: none;
      border: none;
      padding: 3px 6px;
      width: 35px;
      color: #ffffff;
    }
    input[type="number"] {
      -moz-appearance: textfield;
    }
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }
    .unit {
      font-size: 10px;
      color: #396954;
      margin-left: 4px;
    }
  }
}
</style>
