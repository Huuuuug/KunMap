import { Camera, Scene, WebGLRenderer } from "three";
import { Isosurface } from "../elements";

export function createfragment(iso: Isosurface) {
  const { grid, legend } = iso;
  if (grid) {
    const { east, south, west, north } = grid;
    let getColor = "";
    if (iso.gradient) {
      for (let i = 0; i < legend.length - 1; i++) {
        const from = legend[i];
        const to = legend[i + 1];
        getColor += `if(value>=${from[0].toFixed(8)}&&value<${to[0].toFixed(
          8
        )}){
          return mix(${colorToString(from[1])},${colorToString(
          to[1]
        )},(value-(${from[0].toFixed(8)}))/${(to[0] - from[0]).toFixed(8)});
        }`;
      }
      const last = legend[legend.length - 1];
      getColor += `if(value>=${last[0].toFixed(8)}){return ${colorToString(
        last[1]
      )};}`;
    } else {
      for (let i = legend.length - 1; i > -1; i--) {
        const e = legend[i];
        getColor += `if(value>=${e[0].toFixed(8)}) return ${colorToString(
          e[1]
        )}; `;
      }
    }
    let isEdge = "";
    legend.forEach((e) => {
      isEdge += `if((m-(${e[0].toFixed(8)}))*(n-(${e[0].toFixed(
        8
      )}))<0.0){m=${e[0].toFixed(8)};return true;}`;
    });

    let getValue = "return texture2D(u_data, uv).r;";
    if (iso.interpolate) {
      getValue = `
vec2 step = vec2(1.0 / ${grid.columns}.0, 1.0 / ${grid.rows}.0);
vec2 offset = step / 2.0;
vec2 p0 = floor((uv - offset) / step) * step + offset;
vec2 p1 = p0 + step;
vec2 p2 = vec2(p1.x, p0.y);
vec2 p3 = vec2(p0.x, p1.y);
float v0 = texture2D(u_data, p0).r;
float v1 = texture2D(u_data, p1).r;
float v2 = texture2D(u_data, p2).r;
float v3 = texture2D(u_data, p3).r;
float y0 = mix(v0, v2, (uv.x - p0.x) / (p2.x - p0.x));
float y1 = mix(v3, v1, (uv.x - p3.x) / (p1.x - p3.x));
return mix(y0, y1, (uv.y - p0.y) / (p3.y - p0.y));
`;
    }

    const res = `
varying vec2 v_position;
uniform sampler2D u_data;
uniform float u_opacity;
uniform float u_r;
float DDDD = 57.29577951308232;
float RRRR = 6378137.0;
float HPI = 1.5707963267948966;
float CS=0.7071067811865476;
vec2 unproject(vec2 p) {
      return vec2(p.x * DDDD / RRRR,(2.0 * atan(exp(p.y / RRRR)) - HPI ) * DDDD);
}
vec2 toUV(vec2 p){
      return vec2((p.x-(${west.toFixed(8)}))/${(east - west).toFixed(
      8
    )}, (p.y-(${south.toFixed(8)}))/${(north - south).toFixed(8)});
}

float getValue(vec2 xy){
  vec2 uv=toUV(unproject(xy));
      ${getValue}
}

vec4 getColor(float value){
      ${getColor}
      return vec4(0.0,0.0,0.0,0.0);
}

bool isEdge(inout float m, float n){
  ${isEdge}
  return false;
}

vec4 xxxxx(){
  float v=getValue(v_position);
  if(u_r>0.0){
    float vv=getValue(v_position+vec2(0.0,1.0)*u_r);
    if(isEdge(v,vv)){
      return getColor(v);
    }
    vv=getValue(v_position+vec2(0.0,-1.0)*u_r);
    if(isEdge(v,vv)){
      return getColor(v);
    }
    vv=getValue(v_position+vec2(1.0,0.0)*u_r);
    if(isEdge(v,vv)){
      return getColor(v);
    }
    vv=getValue(v_position+vec2(-1.0,0.0)*u_r);
    if(isEdge(v,vv)){
      return getColor(v);
    }    
    vv=getValue(v_position+vec2(CS,CS)*u_r);
    if(isEdge(v,vv)){
      return getColor(v);
    }
    vv=getValue(v_position+vec2(CS,-CS)*u_r);
    if(isEdge(v,vv)){
      return getColor(v);
    }
    vv=getValue(v_position+vec2(-CS,CS)*u_r);
    if(isEdge(v,vv)){
      return getColor(v);
    }
    vv=getValue(v_position+vec2(-CS,-CS)*u_r);
    if(isEdge(v,vv)){
      return getColor(v);
    }
  }
  vec4 color = getColor(v);
  color.a=color.a*u_opacity;
  return color;
}

void main(){
  gl_FragColor=xxxxx();
}
  
  `;

    return res;
  } else {
    throw new Error("缺少数据");
  }
}

function colorToString(color: string) {
  if (color[0] == "#") {
    switch (color.length) {
      case 7:
        return `vec4(${(
          Number.parseInt(color.substring(1, 3), 16) / 255
        ).toFixed(17)},${(
          Number.parseInt(color.substring(3, 5), 16) / 255
        ).toFixed(17)},${(
          Number.parseInt(color.substring(5, 7), 16) / 255
        ).toFixed(17)},1.0)`;
      case 9:
        return `vec4(${(
          Number.parseInt(color.substring(1, 3), 16) / 255
        ).toFixed(17)},${(
          Number.parseInt(color.substring(3, 5), 16) / 255
        ).toFixed(17)},${(
          Number.parseInt(color.substring(5, 7), 16) / 255
        ).toFixed(17)}, ${(
          Number.parseInt(color.substring(7, 9), 16) / 255
        ).toFixed(17)})`;
      default:
        break;
    }
  }
  return "vec4(0.0,0.0,0.0,0.0)";
}

const renderer = new WebGLRenderer({
  alpha: true,
});
renderer.setClearColor(0x000000, 0.0);

export function render(
  scene: Scene,
  camera: Camera,
  canvas: HTMLCanvasElement
) {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext("2d");
  renderer.setSize(width, height, true);
  renderer.render(scene, camera);
  ctx?.drawImage(renderer.domElement, 0, 0);
  return canvas;
}
