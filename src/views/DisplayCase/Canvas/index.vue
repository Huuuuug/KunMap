<template>
  <canvas class="canvas" ref="canvasRef"></canvas>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

const canvasRef = ref<HTMLElement | null>(null);

function draw() {
  const canvas = document.createElement("canvas");
  // const canvas = canvasRef.value;
  console.log(canvas.width);
}
onMounted(() => {
  draw();
});
</script>
<style lang="less" scoped>
.canvas {
  width: 100%;
  height: 100%;
}
</style>
