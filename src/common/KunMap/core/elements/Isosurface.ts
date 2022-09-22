import { BasicElement } from "../BasicElement";
import { numberToColor } from "../utils/OthersUtils";
import { createfragment, render } from "../utils/CreateFragment";
import { Grid } from "./Grid";
import {
  CompoundPath,
  Group,
  Image,
  init,
  PathStyleProps,
  Polyline,
  TextStyleProps,
  ZRenderType,
  Text,
} from "zrender";
import {
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  FloatType,
  Mesh,
  OrthographicCamera,
  RedFormat,
  Scene,
  ShaderMaterial,
} from "three";
import { Projection } from "../utils/Projection";

const vertex = `
varying vec2 v_position;

void main(){
    vec4 mvPosition=modelViewMatrix * vec4(position,1.0);
    v_position=mvPosition.xy;
    gl_Position=projectionMatrix * mvPosition;
}
`;
const searchLine = URL.createObjectURL(
  new Blob([
    `

onmessage=function(e){
  main(e.data.data,e.data.width,e.data.height)
}

const cache = new Map()

function addPoint(i, j, key) {
  const node = {
    i, j,
  }
  const target = cache.get(key)
  if (target) {
    if (target.tails.some((e, index, arr) => {
      const di = Math.abs(e.i - node.i)
      const dj = Math.abs(e.j - node.j)
      if (di < 2 && dj < 2) {
        e.next = node
        node.before = e
        arr.splice(index, 1, node)
        return true
      } else {
        return false
      }
    })) {
      return
    }
    if (target.headers.some((e, index, arr) => {
      const di = Math.abs(e.i - node.i)
      const dj = Math.abs(e.j - node.j)
      if (di < 2 && dj < 2) {
        e.before = node
        node.next = e
        arr.splice(index, 1, node)
        return true
      } else {
        return false
      }
    })) {
      return
    }
    target.headers.push(node)
    target.tails.push(node)
  } else {
    cache.set(key, {
      headers: [node],
      tails: [node]
    })
  }
}

function reverse(from) {
  let next = from.next
  from.next = from.before
  from.before = next
  while (next) {
    from = next
    next = from.next
    from.next = from.before
    from.before = next
  }
}

function connect(from, to, data) {
  for (let i = 0; i < data.headers.length; i++) {
    let _from = data.headers[i];
    let _to = data.tails[i];
    if (Math.abs(_from.i - to.i) < 10 && Math.abs(_from.j - to.j) < 10) {
      to.next = _from
      _from.before = to
      data.headers.splice(i, 1)
      data.tails.splice(i, 1)
      return connect(from, _to, data)
    } else if (Math.abs(from.i - _to.i) < 10 && Math.abs(from.j - _to.j) < 10) {
      from.before = _to
      _to.next = from
      data.headers.splice(i, 1)
      data.tails.splice(i, 1)
      return connect(_from, to, data)
    } else if (Math.abs(from.i - _from.i) < 10 && Math.abs(from.j - _from.j) < 10) {
      reverse(_from)
      from.before = _from
      _from.next = from
      data.headers.splice(i, 1)
      data.tails.splice(i, 1)
      return connect(_to, to, data)
    } else if (Math.abs(to.i - _to.i) < 10 && Math.abs(to.j - _to.j) < 10) {
      reverse(_from)
      to.next = _to
      _to.before = to
      data.headers.splice(i, 1)
      data.tails.splice(i, 1)
      return connect(from, _from, data)
    }
  }
  return from

}

function main(data, width, height) {
  for (let j = 0, k = 3; j < height; j++) {
    for (let i = 0; i < width; i++, k += 4) {
      if (data[k] == 255) {
        const value = 16777216 + data[k - 3] * 65536 + data[k - 2] * 256 + data[k - 1]
        addPoint(i, j, value.toString(16).replace('1', "#"))
      }
    }
  }
  const res = {}
  cache.forEach((e, key) => {
    const lines = []
    while (e.headers.length > 0) {
      const line = []
      let node = connect(e.headers.shift(), e.tails.shift(), e)
      do {
        line.push([node.i, node.j])
        node = node.next
      } while (node)
      lines.push(line)
    }
    res[key]=lines
  })
  postMessage(res)
}

`,
  ])
);

type MarkersManagerOption = {
  legend: [number, string][];
} & IsosurfaceOptions["lineMarker"];

class MarkersManager {
  private _option: MarkersManagerOption;
  private _zr: ZRenderType;
  readonly image = new Image({
    silent: true,
  });
  get legend() {
    return this._option.legend;
  }
  set legend(val) {
    if (this._option.legend != val) {
      this._option.legend = val;
    }
  }
  private _canvas = document.createElement("canvas");
  private _worker?: Worker;
  private _root?: Group;
  private _group = new Group();
  constructor(option: MarkersManagerOption) {
    this._option = option;
    this._zr = init(document.createElement("div"));
    this._zr.add(this.image);
  }
  setClipPath(path: CompoundPath) {
    this.image.setClipPath(path);
  }
  /** 截取数据用于调试 */
  shortcut() {
    const canvas = this._zr.dom!.children[0].children[0] as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const res: number[] = [];
    imageData.data.forEach((e) => {
      res.push(e);
    });
    console.log(JSON.stringify(res), imageData.width, imageData.height);
  }
  clear() {
    this._group.removeAll();
  }
  update(
    scene: Scene,
    camera: OrthographicCamera,
    material: ShaderMaterial,
    scale: number,
    image: Image
  ) {
    const opacity = material.uniforms.u_opacity.value;
    material.uniforms.u_r.value = scale;
    material.uniforms.u_opacity.value = 0;

    const width = Math.round(image.style.width! / scale / 2);
    const height = Math.round(image.style.height! / scale / 2);
    this._zr.resize({
      width,
      height,
    });
    const canvas = this._zr.dom!.children[0].children[0] as HTMLCanvasElement;
    if (!canvas.width || !canvas.height) {
      canvas.width = width;
      canvas.height = height;
    }
    this._canvas.width = width;
    this._canvas.height = height;
    this.image.attr({
      style: {
        width,
        height,
        image: render(scene, camera, this._canvas),
      },
    });
    const clipPath = this.image.getClipPath();
    if (clipPath) {
      const root = image.parent.parent;
      clipPath.attr({
        x: root.x,
        y: root.y,
        scaleX: root.scaleX,
        scaleY: root.scaleY,
      });
    }
    this._zr.refreshImmediately();

    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.getImageData(0, 0, width, height);
    if (this._worker) {
      this._worker.terminate();
    }
    this._root = image.parent;
    this._worker = new Worker(searchLine);
    this._worker.onmessage = (e) => {
      this._onMessage(e, image.z);
    };

    this._worker.postMessage(imageData);
    material.uniforms.u_opacity.value = opacity;
  }
  private _onMessage(e: { data: { [key: string]: number[][][] } }, z: number) {
    const root = this._root!;
    this._worker!.terminate();
    this._worker = undefined;
    const group = new Group({
      silent: true,
    });
    this._option.legend.forEach(([val, key]) => {
      const paths = e.data[key.toLowerCase()];
      if (paths) {
        paths.forEach((e, i, arr) => {
          arr[i] = e.filter((_e, i) => i % 5 == 0);
        });
        paths.forEach((e) => {
          for (let i = 0; i < e.length; i++) {
            e[i] = root.parent.transformCoordToLocal(e[i][0], e[i][1]);
          }
        });
        if (this._option.lineStyle) {
          const line = new CompoundPath({
            z: z + 5,
            shape: {
              paths: paths.map((e) => {
                return new Polyline({
                  shape: {
                    points: e,
                  },
                });
              }),
            },
            style: {
              strokeNoScale: true,
              fill: "none",
              stroke: key,
              ...this._option.lineStyle,
              lineWidth: this._option.lineStyle.lineWidth || 1,
            },
          });
          if (this._option.lineAnima) {
            if (
              !this._option.lineAnima.values ||
              this._option.lineAnima.values.includes(val)
            ) {
              line
                .animate("style", true)
                .when(500, {
                  strokeOpacity: 0,
                })
                .when(1000, {
                  strokeOpacity: 1,
                })
                .start();
            }
          }
          group.add(line);
        }
        if (this._option.textStyle) {
          paths
            .filter((e) => e.length > 50)
            .forEach((e) => {
              let rotation = 0;
              const k = Math.floor(e.length / 2);
              const p = e[k];
              if (this._option.rotate) {
                const p1 = e[k + 1];
                rotation = Math.atan((p[1] - p1[1]) / (p1[0] - p[0]));
              }
              group.add(
                new Text({
                  x: p[0],
                  y: p[1],
                  rotation,
                  silent: true,
                  globalScaleRatio: 0,
                  scaleY: -1,
                  z: z + 10,
                  style: {
                    text: val.toString(),
                    verticalAlign: "middle",
                    align: "center",
                    ...this._option.textStyle,
                  },
                })
              );
            });
        }
      }
    });
    root.remove(this._group);
    root.add(group);
    this._group = group;
  }
}

export interface IsosurfaceOptions {
  values?: number[];
  /** 格点区间 */
  grid: Grid;
  /** 图例 */
  legend?: [number, string][];
  /** 是否显示 */
  show?: boolean;
  /** 线宽 */
  lineWidth?: number;
  /** 渐变 */
  gradient?: boolean;
  /** 透明度 */
  opacity?: number;
  /** 是否插值 */
  interpolate?: boolean;
  /** 缺失数据处理 设置缺失值值 默认为-999999 */
  missingValue?: number;
  /** 相对高度,控制同一图层内元素的遮挡关系 */
  z?: number;
  /** 等值线标注 */
  lineMarker?: {
    rotate?: boolean;
    lineStyle?: PathStyleProps;
    textStyle?: TextStyleProps;
    lineAnima?: {
      values?: number[];
    };
  };
}

export class Isosurface extends BasicElement {
  readonly image: Image;
  private _option: Required<IsosurfaceOptions>;
  private _mesh = new Mesh();
  private _scene = new Scene();
  private _canvas = document.createElement("canvas");
  markersManager?: MarkersManager;
  constructor(name: string, option: IsosurfaceOptions) {
    super(name);
    this._drawIsosurface = this._drawIsosurface.bind(this);
    let legend: [number, string][] = [];
    if (option.values) {
      legend = option.values.map((e, i) => {
        return [e, numberToColor(i)];
      });
    }
    this._option = Object.assign(
      {
        values: [],
        legend,
        show: true,
        lineWidth: 2,
        gradient: false,
        interpolate: true,
        opacity: 0.7,
        missingValue: -999999,
        z: 10,
        lineMarker: false,
      },
      option
    );
    this.image = new Image({
      silent: true,
      scaleY: -1,
      z: this.z,
    });
    this.root.add(this.image);
    this.grid.event.on("frame", this._updateData, this);
    this.grid.event.on("change", this._updateMesh, this);
    this._updateMesh();
    if (this._option.lineMarker) {
      this.markersManager = new MarkersManager({
        ...this._option.lineMarker,
        legend: this.legend,
      });
    }
    if (this._option.grid.clip) {
      const clip = this._option.grid.clip;
      this._updateClip(false);
      clip.event.on("change", () => {
        this._updateClip(false);
      });
    }
  }
  /** 相对高度,控制同一图层内元素的遮挡关系 */
  get z() {
    return this._option.z;
  }
  set z(val) {
    if (this._option.z != val) {
      this._option.z = val;
      this.image.attr({
        z: val,
      });
    }
  }
  /** 格点数据 */
  get grid() {
    return this._option.grid;
  }
  /** 图例数据 */
  get legend() {
    return this._option.legend;
  }
  set legend(val) {
    if (this._option.legend != val) {
      this._option.legend = val;
      if (this.markersManager) {
        this.markersManager.legend = val;
      }
      this._updateFragment(false);
    }
  }
  /** 渐变 */
  get gradient() {
    return this._option.gradient;
  }
  set gradient(val) {
    if (this._option.gradient != val) {
      this._option.gradient = val;
      this._updateFragment();
    }
  }
  /** 是否插值 */
  get interpolate() {
    return this._option.interpolate;
  }
  set interpolate(val) {
    if (this._option.interpolate != val) {
      this._option.interpolate = val;
      this._updateFragment();
    }
  }
  /** 线宽 */
  get lineWidth() {
    return this._option.lineWidth;
  }
  /** 设置线宽 */
  set lineWidth(val) {
    if (this._option.lineWidth != val) {
      this._option.lineWidth = val;
      this._drawIsosurface();
    }
  }

  get material() {
    const material = this._mesh.material;
    if (this.grid && material instanceof ShaderMaterial) {
      return material;
    } else {
      return undefined;
    }
  }
  /** 格点更新 */
  private _updateMesh(reset = true) {
    if (this.grid && this.grid.rows) {
      const { grid } = this;
      const { columns: width, rows: height, east, west, north, south } = grid;
      const geometry = new BufferGeometry();

      const p0 = {
        x: Projection.lonToX(west),
        y: Projection.latToY(south),
      };
      const p1 = {
        x: Projection.lonToX(east),
        y: Projection.latToY(north),
      };
      geometry.attributes.position = new BufferAttribute(
        new Float32Array([
          p0.x,
          p1.y,
          0,
          p1.x,
          p1.y,
          0,
          p0.x,
          p0.y,
          0,
          p1.x,
          p0.y,
          0,
        ]),
        3
      );
      geometry.attributes.uv = new BufferAttribute(
        new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]),
        2
      );
      geometry.index = new BufferAttribute(
        new Uint16Array([0, 2, 1, 2, 3, 1]),
        1
      );
      this._mesh.geometry = geometry;
      let k = 0;
      const data = new Float32Array(width * height);
      grid.data.forEach((e) => {
        e.forEach((f) => {
          if (Number.isNaN(f)) {
            data[k++] = this._option.missingValue;
          } else {
            data[k++] = f;
          }
        });
      });
      const texture = new DataTexture(data, width, height);
      texture.format = RedFormat;
      texture.type = FloatType;
      texture.unpackAlignment = 1;
      texture.needsUpdate = true;
      this._mesh.material = new ShaderMaterial({
        uniforms: {
          u_data: {
            value: texture,
          },
          u_opacity: {
            value: this._option.opacity,
          },
          u_r: {
            value: 0,
          },
        },
        vertexShader: vertex,
        transparent: true,
        fragmentShader: createfragment(this),
      });
    } else {
      this._mesh.geometry = new BufferGeometry();
    }
    if (reset) this._drawIsosurface();
  }
  /**  */
  private _updateData(reset = true) {
    const grid = this.grid;
    const { rows: height, columns: width } = grid;
    const data = new Float32Array(width * height);
    let k = 0;
    grid.data.forEach((e) => {
      e.forEach((f) => {
        if (Number.isNaN(f)) {
          data[k++] = this._option.missingValue;
        } else {
          data[k++] = f;
        }
      });
    });
    const texture = new DataTexture(data, width, height);
    texture.format = RedFormat;
    texture.type = FloatType;
    texture.unpackAlignment = 1;
    texture.needsUpdate = true;
    this.material!.uniforms.u_data.value = texture;

    if (reset) this._drawIsosurface();
  }
  private _updateClip(reset = true) {
    if (this.grid && this.grid.clip && this.grid.clip.paths.length > 0) {
      const paths = this.grid.clip.paths;

      this.root.setClipPath(
        new CompoundPath({
          shape: {
            paths,
          },
        })
      );
      this.markersManager?.image.setClipPath(
        new CompoundPath({
          shape: {
            paths,
          },
        })
      );
    } else {
      this.root.removeClipPath();
      this.markersManager?.image.removeClipPath();
    }
    if (reset) this._drawIsosurface();
  }
  /** 绘制等值面  */
  private _drawIsosurface() {
    if (!this.show) {
      return;
    }
    if (this._map && this.grid && this.grid.rows) {
      const map = this._map;
      const size = map.size;
      const m0 = {
        x: -map.root.x / map.root.scaleX,
        y: (size.y - map.root.y) / map.root.scaleY,
      };
      const m1 = {
        x: (size.x - map.root.x) / map.root.scaleX,
        y: -map.root.y / map.root.scaleY,
      };
      // 计算每个像素的墨卡托距离
      const pixelSize = (m1.x - m0.x) / size.x;
      if (Number.isNaN(pixelSize)) {
        return;
      }
      this.material!.uniforms.u_r.value = (pixelSize / 2) * this.lineWidth;
      this._canvas.width = size.x;
      this._canvas.height = size.y;
      const camera = new OrthographicCamera(m0.x, m1.x, m1.y, m0.y, 0.1, 100);
      camera.position.set(0, 0, 10);
      camera.lookAt(this._scene.position);
      this.image.attr({
        x: m0.x,
        y: m1.y,
        style: {
          width: m1.x - m0.x,
          height: m1.y - m0.y,
          image: render(this._scene, camera, this._canvas),
        },
      });
      this.markersManager?.update(
        this._scene,
        camera,
        this.material!,
        pixelSize / 2,
        this.image
      );
    } else {
      this.image.attr({
        style: {
          width: 0,
          height: 0,
        },
      });
      this.markersManager?.clear();
    }
  }

  private _updateFragment(reset = true) {
    const material = this.material;
    if (material) {
      material.fragmentShader = createfragment(this);
      material.needsUpdate = true;
      reset && this._drawIsosurface();
    }
  }
  onZoomEnd(): void {
    this._drawIsosurface();
  }
  onMoveEnd(): void {
    this._drawIsosurface();
  }
}
