const R = 6378137;
const D = Math.PI / 180;
const RD = R * D;
const r = R / 2;

export const Projection = {
  /** 经度转墨卡托横坐标 */
  lonToX(lon: number) {
    return RD * lon;
  },
  /** 纬度转墨卡托纵坐标 */
  latToY(lat: number) {
    const sin = Math.sin(lat * D);
    return r * Math.log((1 + sin) / (1 - sin));
  },
  /** 墨卡托横坐标转经度 */
  xToLon(x: number) {
    return x / RD;
  },
  /** 墨卡托纵坐标转纬度 */
  yToLat(y: number) {
    return (2 * Math.atan(Math.exp(y / R)) - Math.PI / 2) / D;
  },
};
