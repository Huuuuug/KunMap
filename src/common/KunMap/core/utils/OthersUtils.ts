/** 自动生成颜色 */
export function numberToColor(val: number) {
  return (0x1000000 + val).toString(16).replace("1", "#");
}
