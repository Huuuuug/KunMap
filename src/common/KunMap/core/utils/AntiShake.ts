/**
 * 为目标函数添加防抖
 * @param fn 目标函数
 * @param time 防抖时间间隔
 * @param immediately 是否立即执行
 * @returns 添加完防抖的目标函数
 */
export function antiShake<T extends (...args: any) => void>(
  fn: T,
  time = 0,
  immediately = false
) {
  let handler = 0;
  let lock = 0;
  if (immediately) {
    return function (...args: any) {
      const now = Date.now();
      if (handler) {
        clearTimeout(handler);
      }
      if (lock < now) {
        fn(...args);
        lock = now + time;
      } else {
        handler = window.window.setTimeout(() => {
          handler = 0;
          fn(...args);
        }, lock - now);
      }
    } as T;
  } else {
    return function (...args: any) {
      const now = Date.now();
      if (handler) {
        clearTimeout(handler);
        handler = window.setTimeout(() => {
          handler = 0;
          fn(...args);
        }, lock - now);
      } else {
        lock = now + time;
        handler = window.setTimeout(() => {
          handler = 0;
          fn(...args);
        }, time);
      }
    } as T;
  }
}
