export class OneDimensional {
  private k: number;
  private b: number;
  /**
   * 一维数组映射器
   * @param from 坐标
   * @param to 经纬度
   */
  constructor(from: [number, number], to: [number, number] = [0, 1]) {
    const d = from[1] - from[0];
    this.k = (to[1] - to[0]) / d;
    this.b = (to[0] * from[1] - to[1] * from[0]) / d;
  }
  /** 从from映射到to */
  forward(x: number) {
    return this.k * x + this.b;
  }
  /** 从to映射到from */
  backward(y: number) {
    return (y - this.b) / this.k;
  }
}
