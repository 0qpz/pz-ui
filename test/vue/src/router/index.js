import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue';
import background from '../views/background-test.vue';
import batchTest from '../views/batch-test.vue';
import batchFlexTest from '../views/batch-flex-test.vue';
const router = createRouter({
  // 【注意】如果 BASE_URL 有问题导致白屏，可以先改成 '/' 或者直接留空测试
  // 正常生产环境通常是 import.meta.env.BASE_URL
  history: createWebHistory(import.meta.env?.BASE_URL || '/'),

  routes: [
    {
      path: '/',
      component: App
    },
    {
      path: '/background',
      component: background
    },
    {
      path: '/batch-test',
      component: batchTest
    },
    {
      path: '/batch-flex-test',
      component: batchFlexTest
    }
  ],
})

export default router