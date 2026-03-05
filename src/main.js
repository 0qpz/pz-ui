// src/pz-ui.js
import Config from '@/core/config.js';
import Log from "@/util/log.js";
import { scanAndApply, watchAttributeChanges, getOrCreateHashClass as getOrCreateHashClassDirect } from '@/util/scanner.js'; // 引入扫描器和属性监听

const Pz = {
    Config,
    Log,

    install(app) {
        console.log("✅ 破竹 UI (Pz) 已就绪");

        // --- Vue 指令模式：data-pz，批量处理优化 ---
        let batchUpdateQueue = null;
        
        app.directive('pz', {
            mounted(el, binding) {
                const pzValue = binding.value;
                if (!pzValue) return;
                
                // 加入批处理队列
                if (!batchUpdateQueue) {
                    batchUpdateQueue = [];
                    Promise.resolve().then(() => {
                        const queue = batchUpdateQueue;
                        batchUpdateQueue = null;
                        for (let i = 0; i < queue.length; i++) {
                            const item = queue[i];
                            const className = getOrCreateHashClassDirect(item.pzValue);
                            if (className) {
                                item.el.classList.add(className);
                                item.el._pzClassName = className;
                                item.el._pzProcessed = true;
                                item.el._pzValue = item.pzValue;
                            }
                        }
                    });
                }
                batchUpdateQueue.push({ el, pzValue });
            },
            updated(el, binding) {
                const newPzValue = binding.value;
                const oldPzValue = binding.oldValue;
                
                // 如果值没有变化，直接返回
                if (newPzValue === oldPzValue) return;
                
                // 移除旧的 class
                if (el._pzClassName) {
                    el.classList.remove(el._pzClassName);
                }
                
                // 如果有新值，应用新的 class
                if (newPzValue) {
                    const className = getOrCreateHashClassDirect(newPzValue);
                    if (className) {
                        el.classList.add(className);
                        el._pzClassName = className;
                    }
                    el._pzProcessed = true;
                    el._pzValue = newPzValue;
                } else {
                    // 如果没有值，清除标记
                    delete el._pzProcessed;
                    delete el._pzValue;
                }
            },
            unmounted(el) {
                // 清理标记
                delete el._pzProcessed;
                delete el._pzValue;
                delete el._pzClassName;
            }
        });

        app.provide('Pz', Pz);
        app.config.globalProperties.Pz = Pz;
    }
};

// --- 原生 HTML 部分 (超高速简化版) ---
if (typeof window !== 'undefined') {
    const runScanner = () => {
        // 【性能优化】只调用一次，之后完全依赖缓存
        scanAndApply();
    };

    // DOM 加载完成后立即执行
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        runScanner();
    } else {
        document.addEventListener('DOMContentLoaded', runScanner);
    }

    // 【关键优化】移除 MutationObserver！
    // 不再自动监听 DOM 变化，由用户手动控制
    // 这样可以避免每次插入元素都触发 scanAndApply()

    window.Pz = Pz;
}

export default Pz;