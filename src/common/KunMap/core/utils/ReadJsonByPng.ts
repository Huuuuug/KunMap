interface CharData {
  [key: number]: string;
}

/** 解析后的图片数据 */
export interface PNGData {
  data: Array<number>;
  sLon: number; //东
  sLat: number; //南
  eLon: number; //西
  eLat: number; //北
  width: number;
  height: number;
  latStep: number;
  lonStep: number;
}

/** 字符集 */
const charData: CharData = {
  0: "A",
  1: "B",
  2: "C",
  3: "D",
  4: "E",
  5: "F",
  6: "G",
  7: "H",
  8: "I",
  9: "J",
  10: "K",
  11: "L",
  12: "M",
  13: "N",
  14: "O",
  15: "P",
  16: "Q",
  17: "R",
  18: "S",
  19: "T",
  20: "U",
  21: "V",
  22: "W",
  23: "X",
  24: "Y",
  25: "Z",
  26: "a",
  27: "b",
  28: "c",
  29: "d",
  30: "e",
  31: "f",
  32: "g",
  33: "h",
  34: "i",
  35: "j",
  36: "k",
  37: "l",
  38: "m",
  39: "n",
  40: "o",
  41: "p",
  42: "q",
  43: "r",
  44: "s",
  45: "t",
  46: "u",
  47: "v",
  48: "w",
  49: "x",
  50: "y",
  51: "z",
  52: "0",
  53: "1",
  54: "2",
  55: "3",
  56: "4",
  57: "5",
  58: "6",
  59: "7",
  60: "8",
  61: "9",
  62: "+",
  63: "/",
  64: "=",
};

const PNGAnalysis = {
  /** 解析图片成对象 */
  getInfoByImg: function (ctx: CanvasRenderingContext2D, img: any) {
    const conf = this.getConf(ctx);
    const headerLine = 1;
    const headerlength = conf[1];
    const info = this.getHeader(ctx, headerLine, img, headerlength);
    info["headerLine"] = headerLine;
    info["data"] = this.getGridData(ctx, headerLine, img, info);
    return info;
  },
  /**
   * 获取图片格点数据
   * @param ctx 图片信息
   * @param hL
   * @param img 图片
   * @param info
   * @returns
   */
  getGridData: function (
    ctx: CanvasRenderingContext2D,
    hL: number,
    img: any,
    info: any
  ) {
    //缩放比
    const scaleFactor = info["scaleFactor"] || 1;
    //偏移量
    const addOffset = info["addOffset"] | 0;
    //宽度
    const width = img.width;
    //高度
    const height = img.height;
    const arr = [];
    const grids: Uint8ClampedArray = ctx.getImageData(
      0,
      hL,
      width,
      height - hL
    ).data;
    if (info.sLat > info.eLat) {
      // 从左上角开始统计
      for (let i = hL; i < height; i++) {
        for (let j = 0; j < width; j++) {
          const curIndex = ((i - hL) * width + j) * 4;
          arr.push(
            grids[curIndex + 3]
              ? (grids[curIndex] +
                  grids[curIndex + 1] * 255 +
                  grids[curIndex + 2] * 65025) /
                  scaleFactor -
                  addOffset
              : NaN
          );
        }
      }
    } else {
      // 从左下角开始统计
      for (let i = height - 1; i >= hL; i--) {
        for (let j = 0; j < width; j++) {
          const curIndex = ((i - hL) * width + j) * 4;
          arr.push(
            grids[curIndex + 3]
              ? (grids[curIndex] +
                  grids[curIndex + 1] * 255 +
                  grids[curIndex + 2] * 65025) /
                  scaleFactor -
                  addOffset
              : NaN
          );
        }
      }
    }
    return arr;
  },
  /** 获取canvas对象内容 */
  getConf: function (ctx: CanvasRenderingContext2D) {
    const pointInfo = ctx.getImageData(0, 0, 2, 2).data;
    return [pointInfo[0], pointInfo[1] + pointInfo[2] * 255];
  },
  /**
   * 获取格点图头部信息
   * @param ctx 图片信息
   * @param hL 头部高度
   * @param img 图片
   * @param hLen 信息长度
   * @returns 头部信息
   */
  getHeader: function (
    ctx: CanvasRenderingContext2D,
    hL: number,
    img: any,
    hLen: number
  ) {
    const width = img.width;
    let headerStr = "";
    // 头部信息
    const headerData: Uint8ClampedArray = ctx.getImageData(
      0,
      0,
      width,
      hL
    ).data;
    const w = Math.floor(hLen / 3) + (hLen % 3 == 0 ? 0 : 1) + 1;
    for (let i = 1; i < w; i++) {
      const sub = hLen - 3 * (i - 1);
      if (sub < 3) {
        for (let j = 0; j <= sub; j++) {
          headerStr += this.getChar(headerData[4 * i + j]);
        }
      } else {
        headerStr +=
          this.getChar(headerData[4 * i]) +
          this.getChar(headerData[4 * i + 1]) +
          this.getChar(headerData[4 * i + 2]);
      }
    }
    return JSON.parse(decodeURIComponent(atob(headerStr)));
  },
  /** 匹配字符集 */
  getChar: function (index: number) {
    if (index === 255) {
      return "";
    }
    return charData[index];
  },
};
export function readJsonByImg(url: string): Promise<PNGData>;
export function readJsonByImg(url: string) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = url;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const gridDataInfo = PNGAnalysis.getInfoByImg(ctx, img);
        resolve(gridDataInfo);
      }
    };
    img.onerror = () => {
      resolve(false);
    };
  });
}
