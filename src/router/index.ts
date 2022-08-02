import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "index",
    component: () => import("../views/Index/index.vue"),
  },
  {
    path: "/CasePerformance",
    name: "CasePerformance",
    component: () => import("../views/CasePerformance/index.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
