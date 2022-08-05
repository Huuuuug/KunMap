import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/DisplayCase",
  },
  {
    path: "/DisplayCase",
    name: "DisplayCase",
    redirect: "/MapComponent",
    component: () => import("../views/DisplayCase/index.vue"),
    children: [
      {
        /** 地图 */
        path: "/MapComponent",
        component: () => import("../views/DisplayCase/MapComponent/index.vue"),
      },
      {
        /** 分类雷达图 */
        path: "/ClassificationStatistical",
        component: () =>
          import(
            "../views/DisplayCase/ClassificationStatisticalFigure/index.vue"
          ),
      },
      {
        /** 不同颜色的线 */
        path: "/DifferentColorLine",
        component: () =>
          import("../views/DisplayCase/DifferentColorLine/index.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
