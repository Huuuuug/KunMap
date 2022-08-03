import { Circle, Group, Polygon, registerPainter } from "zrender";
import CanvasPainter from "zrender/lib/canvas/Painter";
registerPainter("canvas", CanvasPainter);

export default function () {
  /**
   * 创建根节点
   * @param width 画布宽
   * @param height 画布高
   * @returns 原点在画布中心的集合
   */
  const createRoot = (width: number, height: number) => {
    return new Group({
      x: width / 2,
      y: height / 2,
    });
  };
  /**
   * 创建背景
   * @param r 最大半径
   * @returns 五个同心圆
   */
  const createBackgroud = (r: number) => {
    const group = new Group();
    for (let i = 0; i < 5; i++) {
      group.add(
        new Circle({
          silent: true,
          shape: {
            r: r * (i + 1) * 0.2,
          },
          style: {
            fill: "none",
            stroke: "#836FFF",
            lineWidth: 4,
            strokeOpacity: 1,
          },
        })
      );
    }
    return group;
  };
  /**
   * 计算数据相关坐标
   * @param data 数据
   * @param max 可承载最大值
   * @param r 最大半径
   * @returns 数据点和标签的坐标
   */
  const getDataPosition = (data: number[], max: number, r: number) => {
    const datas: [number, number][] = [];
    const labels: [number, number][] = [];
    const radian = (Math.PI * 2) / data.length;
    const l = r + 15;
    data.forEach((e, i) => {
      const d = (e / max) * r;
      const a = radian * i;
      const x = Math.sin(a);
      const y = -Math.cos(a);
      datas.push([d * x, d * y]);
      labels.push([l * x, l * y]);
    });
    return {
      datas,
      labels,
    };
  };
  /**
   * @param points 控制点坐标
   * @param colors 控制点颜色
   * @returns 数据线和原点
   */
  const createCable = (points: [number, number][], colors: string[]) => {
    const group = new Group();
    for (let i = 0; i < 1; i += 0.1) {
      const a = 1 - i;
      console.log(a);

      const polygon = new Polygon({
        silent: true,
        shape: {
          points: points.map(() => [0, 0]),
        },
        style: {
          lineWidth: 1,
          stroke: "#59E4FF",
          fill: "#5FD5EC",
          fillOpacity: 0.2,
        },
      });
      polygon
        .animate("shape", false)
        .when(1000, { points: points.map((p) => [a * p[0], a * p[1]]) })
        .start();
    }
    // points.forEach((p,i) => {
    //   const g = new Group()
    //   g.
    // })
    return group;
  };

  return {
    createRoot,
    createBackgroud,
    getDataPosition,
    createCable,
  };
}
