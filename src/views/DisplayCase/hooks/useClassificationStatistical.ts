export interface ClassifyData {
  name: string;
  value: number;
  color: string;
}

export default function () {
  /**
   * 随机生成指定数量的数据
   * @param num 生成数据条数
   * @returns 测试数据
   */
  const randomlyGenerateClassifyDatas = (num: number) => {
    const res: ClassifyData[] = [];
    for (let i = 1; i <= num; i++) {
      res.push({
        name: "测试数据" + i,
        value: Math.floor(Math.random() * 500),
        color: "#000",
      });
    }
    return res;
  };
  return {
    randomlyGenerateClassifyDatas,
  };
}
