<template>
  <div class="container">
    <canvas class="canvas" ref="canvasRef"></canvas>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";

const canvasRef = ref<HTMLCanvasElement | null>(null);

/** 绘制网格 */
function drawGrid(ctx: CanvasRenderingContext2D) {
  const gridSize = 10;
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;
  // x轴grid 横线的条数
  const xLineTotal = Math.floor(canvasHeight / gridSize);
  for (let i = 0; i <= xLineTotal; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvasWidth, i * gridSize);
    ctx.strokeStyle = "#C0C0C0";
    ctx.stroke();
  }
  // y轴grid 纵线的条数
  const yLineTotal = Math.floor(canvasWidth / gridSize);
  for (let i = 0; i <= yLineTotal; i++) {
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvasHeight);
    ctx.strokeStyle = "#C0C0C0";
    ctx.stroke();
  }
}
/** 绘制坐标轴 */
function drawCoordinate(ctx: CanvasRenderingContext2D) {
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;
  const space = 20;
  const arrowSize = 10;

  // 绘制坐标原点
  const origin = { x: space, y: canvasHeight - space };
  console.log(origin);

  const orignDotSize = 10;
  // ctx.moveTo(origin.x - orignDotSize / 2, origin.y - orignDotSize / 2);
  // ctx.lineTo(origin.x - orignDotSize / 2, origin.y + orignDotSize / 2);
  // ctx.lineTo(origin.x + orignDotSize / 2, origin.y + orignDotSize / 2);
  // ctx.lineTo(origin.x + orignDotSize / 2, origin.y - orignDotSize / 2);
  // ctx.fill();
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, space / 8, 0, 2 * Math.PI);
  ctx.fill();

  // 绘制x轴
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(canvasWidth - space, origin.y);
  ctx.strokeStyle = "#000";
  ctx.stroke();
  // 箭头
  ctx.lineTo(canvasWidth - space - arrowSize, origin.y + arrowSize / 2);
  ctx.lineTo(canvasWidth - space - arrowSize, origin.y - arrowSize / 2);
  ctx.lineTo(canvasWidth - space, origin.y);
  ctx.fill();

  // 绘制y轴
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(space, space);
  ctx.stroke();
  // 箭头
  ctx.lineTo(origin.x - arrowSize / 2, space + arrowSize);
  ctx.lineTo(origin.x + arrowSize / 2, space + arrowSize);
  ctx.lineTo(space, space);
  ctx.fill();
}

function draw() {
  if (canvasRef.value) {
    const canvas = canvasRef.value;
    const ctx = canvas.getContext("2d")!;
    // 设置画布大小
    canvas.width = 1200;
    canvas.height = 600;
    drawGrid(ctx);
    drawCoordinate(ctx);
  }
}
onMounted(() => {
  draw();
});
</script>
<style lang="less" scoped>
.container {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 20px;
  .canvas {
    width: 1200px;
    height: 600px;
  }
}
</style>
