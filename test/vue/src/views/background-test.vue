<script>
import Pz from '../pz-ui.es.js';
Pz.Config.Debug();
Pz.Config.SetKey('log', 'debug');
Pz.Log.debug("测试debug");
Pz.Log.info("测试 info");
Pz.Log.warn("测试 warn");
Pz.Log.error("测试 error");

export default {
  data() {
    return {
      color1: 'background-fafafa',
      color2: 'background-ffffff',
      color3: 'background-f0f0f0'
    }
  },
  methods: {
    changeColors() {
      // 动态变化颜色，测试 CSS 是否正常更新
      this.color1 = 'background-ffeb3b';
      this.color2 = 'background-4caf50';
      this.color3 = 'background-2196f3';
      console.log('🎨 颜色已动态变化！检查 CSS 是否正常生效');
    },
    resetColors() {
      this.color1 = 'background-fafafa';
      this.color2 = 'background-ffffff';
      this.color3 = 'background-f0f0f0';
      console.log('🔄 颜色已重置');
    }
  }
}
</script>

<template>

  <h1>🎨 Pz UI 背景色测试</h1>

  <div class="test-section">
    <h2>测试 1: 三种背景色（静态）</h2>

    <div class="test-box" :data-pz="color1">
      背景色：{{ color1 }} (浅灰 → 黄色)
    </div>

    <div class="test-box" :data-pz="color2">
      背景色：{{ color2 }} (白色 → 绿色)
    </div>

    <div class="test-box" :data-pz="color3">
      背景色：{{ color3 }} (更深的灰 → 蓝色)
    </div>

    <div class="test-box" data-pz="background-f0f0f0">
      背景色：#f0f0f0 (更深的灰) - 静态不变
    </div>

    <div style="margin-top: 20px;">
      <button @click="changeColors" style="padding: 10px 20px; margin-right: 10px; background: #409EFF; color: white; border: none; border-radius: 4px; cursor: pointer;">
        🎨 动态变化颜色
      </button>
      <button @click="resetColors" style="padding: 10px 20px; background: #909399; color: white; border: none; border-radius: 4px; cursor: pointer;">
        🔄 重置颜色
      </button>
    </div>
  </div>
</template>

<style >
.test-box {
  margin: 10px 0;
  padding: 20px;
  border: 1px solid #ddd;
}
</style>