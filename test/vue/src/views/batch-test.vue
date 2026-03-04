<script setup>
import { ref, onMounted } from 'vue';
import Pz from '../pz-ui.es.js';

// 启用调试模式
Pz.Config.Debug();
Pz.Config.SetKey('log', 'debug');

const componentCount = ref(0);
const container = ref(null);
const statsText = ref('当前组件数：0');
let colorIndex = 0; // 颜色轮换索引

// 性能监控
function updateStats() {
  statsText.value = `当前组件数：${componentCount.value.toLocaleString()}`;
}

// 添加组件
function addComponents(count) {
  const startTime = performance.now();
  
  // 【性能优化】使用 DocumentFragment 批量插入
  const fragment = document.createDocumentFragment();
  
  // 【性能优化】批量创建元素，每批 200 个
  const BATCH_SIZE = 200;
  for (let b = 0; b < count; b += BATCH_SIZE) {
    const batchFragment = document.createDocumentFragment();
    const end = Math.min(b + BATCH_SIZE, count);
    
    for (let i = b; i < end; i++) {
      // 直接创建子元素，不需要外层容器
      for (let j = 0; j < 3; j++) {
        const child = document.createElement('div');
        // 使用和背景测试页面一致的样式：class="test-box" + data-pz 只控制背景色
        child.className = 'test-box';
        child.setAttribute('data-pz', 'background-fafafa');
        child.textContent = `组件${componentCount.value + i + 1}-${j+1}`;
        batchFragment.appendChild(child);
      }
    }
    fragment.appendChild(batchFragment);
  }
  
  container.value.appendChild(fragment);
  componentCount.value += count;
  updateStats();
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`✅ 添加 ${count} 个组件耗时：${duration.toFixed(2)}ms`);
  console.log(`   平均每个组件：${(duration / count).toFixed(3)}ms`);
  console.log(`   🎯 INP 目标：<100ms (当前 ${duration.toFixed(2)}ms)`);
  console.log(`   📊 总 DOM 元素数：${document.body.getElementsByTagName('*').length.toLocaleString()}`);
  
  // 显示在页面上
  const resultDiv = document.createElement('div');
  resultDiv.style.cssText = 'padding: 10px; margin: 10px 0; background: #f0f0f0; border-radius: 4px;';
  resultDiv.innerHTML = `
    <strong>添加 ${count} 个组件：</strong>
    耗时 <span style="color: ${duration < 50 ? 'green' : duration < 100 ? 'orange' : 'red'}">
      ${duration.toFixed(2)}ms
    </span> | 
    平均 ${(duration / count).toFixed(3)}ms/组件 |
    总 DOM: ${document.body.getElementsByTagName('*').length.toLocaleString()} 个
  `;
  container.value.insertBefore(resultDiv, container.value.firstChild);
}

// 清空组件
function clearComponents() {
  container.value.innerHTML = '';
  componentCount.value = 0;
  updateStats();
}

// 批量换色 - 测试性能
function batchChangeColors() {
  const startTime = performance.now();
  
  // 获取所有带有 data-pz 的元素
  const allElements = container.value.querySelectorAll('[data-pz]');
  const colors = ['background-ffeb3b', 'background-4caf50', 'background-2196f3', 'background-ff9800', 'background-9c27b0'];
  let changedCount = 0;
  
  // 批量更新每个元素的 data-pz 属性
  allElements.forEach((el, index) => {
    const oldPzValue = el.getAttribute('data-pz');
    // 如果是 background-xxx 格式，直接替换颜色值
    if (oldPzValue && oldPzValue.startsWith('background-')) {
      const colorIndex = index % colors.length;
      el.setAttribute('data-pz', colors[colorIndex]);
      changedCount++;
    }
  });
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`🎨 批量换色完成：更新了 ${changedCount} 个元素`);
  console.log(`   耗时：${duration.toFixed(2)}ms`);
  console.log(`   平均每个元素：${(duration / Math.max(changedCount, 1)).toFixed(3)}ms`);
  console.log(`   🎯 INP 目标：<100ms (当前 ${duration.toFixed(2)}ms)`);
  
  // 显示在页面上
  const resultDiv = document.createElement('div');
  resultDiv.style.cssText = 'padding: 10px; margin: 10px 0; background: #e3f2fd; border-radius: 4px; border-left: 4px solid #2196f3;';
  resultDiv.innerHTML = `
    <strong>🎨 批量换色：</strong>
    更新 <span style="color: #1976d2; font-weight: bold;">${changedCount.toLocaleString()}</span> 个元素 |
    耗时 <span style="color: ${duration < 50 ? 'green' : duration < 100 ? 'orange' : 'red'}">
      ${duration.toFixed(2)}ms
    </span> |
    平均 ${(duration / Math.max(changedCount, 1)).toFixed(3)}ms/元素
  `;
  container.value.insertBefore(resultDiv, container.value.firstChild);
}

// 初始化：添加一些测试组件
onMounted(() => {
  setTimeout(() => {
    addComponents(100);
  }, 500);
});
</script>

<template>
  <div class="controls">
    <h3 style="margin: 0 0 10px 0;">性能测试</h3>
    <button @click="addComponents(100)">+100 个组件</button>
    <button @click="addComponents(1000)">+1000 个组件</button>
    <button @click="addComponents(10000)">+10000 个组件</button>
    <button @click="batchChangeColors()">🎨 批量换色</button>
    <button @click="clearComponents()">清空</button>
    <div class="stats">{{ statsText }}</div>
  </div>

  <h1>🚀 Pz UI 批量性能测试（Vue 版本）</h1>
  <p>点击右侧按钮批量添加组件，测试性能表现</p>

  <!-- 组件容器 -->
  <div ref="container" id="container"></div>
</template>

<style scoped>
body {
  margin: 0;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.controls {
  position: fixed;
  top: 10px;
  right: 10px;
  background: white;
  padding: 15px;
  border: 2px solid #409EFF;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  z-index: 1000;
}

button {
  display: block;
  width: 100%;
  margin: 5px 0;
  padding: 8px 15px;
  cursor: pointer;
  background: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
}

button:hover {
  background: #66b1ff;
}

.stats {
  margin-top: 10px;
  font-size: 12px;
  color: #666;
}

.test-box {
  margin: 10px 0;
  padding: 20px;
  border: 1px solid #ddd;
}
</style>
