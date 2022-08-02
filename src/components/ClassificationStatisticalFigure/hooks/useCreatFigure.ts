import { Group } from "zrender";

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

  return {
    createRoot,
  };
}
