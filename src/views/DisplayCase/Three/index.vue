<template>
  <div class="container" ref="threeRef"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import {
  WebGLRenderer,
  Scene,
  AxesHelper,
  Mesh,
  PointLight,
  AmbientLight,
  OrthographicCamera,
  SphereGeometry,
  OctahedronGeometry,
  MeshPhongMaterial,
  BufferGeometry,
  BufferAttribute,
  MeshBasicMaterial,
  DoubleSide,
  PointsMaterial,
  Points,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { color } from "zrender";

let width = ref(0);
let height = ref(0);

const scene = new Scene();

const threeRef = ref<HTMLDivElement>();

const renderer = new WebGLRenderer();

const axisHelper = new AxesHelper(250);
scene.add(axisHelper);

const geometry = new BufferGeometry();

const vertices = new Float32Array([
  0,
  0,
  0, //顶点1坐标
  50,
  0,
  0, //顶点2坐标
  0,
  100,
  0, //顶点3坐标
  0,
  0,
  0, //顶点4坐标
  0,
  0,
  100, //顶点5坐标
  50,
  0,
  0, //顶点6坐标
]);
const normals = new Float32Array([
  0,
  0,
  1, //顶点1法向量
  0,
  0,
  1, //顶点2法向量
  0,
  0,
  1, //顶点3法向量

  0,
  1,
  0, //顶点4法向量
  0,
  1,
  0, //顶点5法向量
  0,
  1,
  0, //顶点6法向量
]);
// const colors = new Float32Array([
//   1,
//   0,
//   0, //顶点1颜色
//   0,
//   1,
//   0, //顶点2颜色
//   0,
//   0,
//   1, //顶点3颜色

//   1,
//   1,
//   0, //顶点4颜色
//   0,
//   1,
//   1, //顶点5颜色
//   1,
//   0,
//   1, //顶点6颜色
// ]);
const attribue = new BufferAttribute(vertices, 3);
geometry.attributes.position = attribue;

geometry.attributes.normal = new BufferAttribute(normals, 3);
// geometry.attributes.color = new BufferAttribute(colors, 3);

// const geometry = new BoxGeometry(100, 100, 100);
// const geometry1 = new SphereGeometry(60, 40, 40);
// const geometry2 = new OctahedronGeometry(60);
const material = new MeshBasicMaterial({
  color: 0x000144, //三角面颜色
  // vertexColors: true, //以顶点颜色为准
  side: DoubleSide, //两面可见
});
const mesh = new Mesh(geometry, material);
// const mesh1 = new Mesh(geometry1, material);
// mesh1.position.set(120, 0, 0);
// scene.add(mesh1);
// const mesh2 = new Mesh(geometry2, material);
// scene.add(mesh2);
scene.add(mesh);
// var material = new PointsMaterial({
//   color: 0xff0000,
//   size: 10.0, //点对象像素尺寸
// }); //材质对象
// var points = new Points(geometry, material); //点模型对象
// scene.add(points); //点对象添加到场景中

// const point = new PointLight(0xffffff);
// point.position.set(400, 200, 300);
// scene.add(point);

const ambient = new AmbientLight(0x444444);
scene.add(ambient);

let camera: OrthographicCamera;

function init() {
  renderer.render(scene, camera);
  // mesh.rotateY(0.01);
  // requestAnimationFrame(init);
}

onMounted(() => {
  width.value = threeRef.value!.clientWidth;
  height.value = threeRef.value!.clientHeight;
  const k = width.value / height.value;
  const s = 200;
  camera = new OrthographicCamera(-s * k, s * k, s, -s, 1, 1000);
  camera.position.set(400, 300, 200);
  camera.lookAt(scene.position);

  var controls = new OrbitControls(camera, renderer.domElement); //创建控件对象
  controls.addEventListener("change", init); //监听鼠标、键盘事件

  threeRef.value?.appendChild(renderer.domElement);
  renderer.setSize(width.value, height.value);
  renderer.setClearColor(0xb9d3ff, 1);

  init();
  // setInterval(() => {
  //   init();
  // }, 20);
});
</script>
<style lang="less" scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
