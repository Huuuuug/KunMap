import { Circle, Text, Group, Polygon, registerPainter } from "zrender";
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
    const l = r + 35;
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
  const createCable = (
    points: [number, number][],
    colors: string[],
    onFocus: (i: number) => void,
    onBlur: () => void
  ) => {
    const group = new Group();
    for (let i = 0; i < 1; i += 0.1) {
      const a = 1 - i;
      const polygon = new Polygon({
        silent: true,
        shape: {
          points: points.map(() => [0, 0]),
        },
        style: {
          lineWidth: 1,
          stroke: "#3300CC",
          fill: "#3300FF",
          fillOpacity: 0.2,
        },
      });
      polygon
        .animate("shape", false)
        .when(500, { points: points.map((p) => [a * p[0], a * p[1]]) })
        .start();
      group.add(polygon);
    }
    /** 数据点 */
    points.forEach((p, i) => {
      const pointGroup = new Group();
      pointGroup.add(
        new Circle({
          silent: true,
          shape: {
            r: 5,
          },
          style: {
            fill: colors[i],
          },
        })
      );
      const circle = new Circle({
        shape: {
          r: 10,
        },
        style: {
          fill: "none",
          stroke: "#396954",
          lineWidth: 2,
        },
      });
      circle.on("mouseover", () => {
        onFocus(i);
        circle.attr({
          style: {
            stroke: colors[i],
          },
        });
      });
      circle.on("mouseout", () => {
        onBlur();
        circle.attr({
          style: {
            stroke: "#FFCC00",
          },
        });
      });
      pointGroup.add(circle);
      pointGroup
        .animate("", false)
        .when(500, {
          x: p[0],
          y: p[1],
        })
        .start();
      group.add(pointGroup);
    });
    return group;
  };
  /**
   * 创建标签
   * @param points 标签坐标点
   * @param labels 标签文本
   * @returns 标签
   */
  const createLabel = (points: [number, number][], labels: string[]) => {
    const group = new Group();
    points.forEach((p, i) => {
      group.add(
        new Text({
          silent: true,
          x: p[0],
          y: p[1],
          style: {
            fill: "#993300",
            fontSize: 15,
            text: labels[i],
            align: "center",
            verticalAlign: "middle",
          },
        })
      );
    });
    return group;
  };

  return {
    createRoot,
    createBackgroud,
    getDataPosition,
    createCable,
    createLabel,
  };
}
