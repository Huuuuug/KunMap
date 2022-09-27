<template>
  <div class="display-case">
    <el-menu default-active="2" class="el-menu-vertical-demo">
      <el-menu-item index="1" @click="$router.push('/MapComponent')">
        <el-icon :size="18">
          <Location />
        </el-icon>
        <template #title> 地图 </template>
      </el-menu-item>
      <el-sub-menu index="2">
        <template #title>
          <el-icon :size="18">
            <IconMenu />
          </el-icon>
          <span>玛卡巴卡</span>
        </template>
        <el-menu-item
          index="2-1"
          @click="$router.push('/ClassificationStatistical')"
          >分类雷达图</el-menu-item
        >
        <el-menu-item index="2-2" @click="$router.push('/DifferentColorLine')"
          >不同颜色的线</el-menu-item
        >
        <el-menu-item index="2-3" @click="$router.push('/Canvas')"
          >Canvas 测试</el-menu-item
        >
        <el-menu-item index="2-4" @click="$router.push('/Zrender')"
          >Zrender 测试</el-menu-item
        >
        <el-menu-item index="2-5" @click="$router.push('/Three')"
          >Three</el-menu-item
        >
      </el-sub-menu>
    </el-menu>
    <div class="display-container">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Menu as IconMenu, Location } from "@element-plus/icons-vue";
</script>

<style lang="less" scoped>
.display-case {
  width: 100%;
  height: 100%;
  display: flex;
  .el-menu-vertical-demo {
    width: 300px;
    height: 100%;
    user-select: none;
  }
  .display-container {
    width: calc(100% - 300px);
    height: 100%;
  }
}
</style>
