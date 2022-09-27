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
      {
        /** 画布 */
        path: "/Canvas",
        component: () => import("../views/DisplayCase/Canvas/index.vue"),
      },
      {
        /** Zrender */
        path: "/Zrender",
        component: () => import("../views/DisplayCase/Zrender/index.vue"),
      },
      {
        /** Three */
        path: "/Three",
        component: () => import("../views/DisplayCase/Three/index.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
