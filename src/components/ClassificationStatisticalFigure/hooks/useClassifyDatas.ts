export interface ClassifyData {
  name: string;
  value: number;
  color: string;
}

export default function () {
  /** 随机颜色 */
  const colors = [
    "#CCFF00",
    "#99FF00",
    "#66FF00",
    "#33FF00",
    "#00FF00",
    "#CCFFFF",
    "#99FFFF",
    "#66FFFF",
    "#33FFFF",
    "#00FFFF",
  ];
  /**
   * 随机生成指定数量的数据
   * @returns 测试数据
   */
  const randomlyGenerateClassifyDatas = (num: number, max: number) => {
    const res: ClassifyData[] = [];
    for (let i = 1; i <= num; i++) {
      res.push({
        name: "数据" + i,
        value: Math.floor(Math.random() * max),
        color: colors[Math.floor(Math.random() * 10)],
      });
    }
    return res;
  };
  return {
    randomlyGenerateClassifyDatas,
  };
}
