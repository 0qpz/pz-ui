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

// --- 原生 HTML 部分 (增强版) ---
if (typeof window !== 'undefined') {
    const runScanner = () => {
        // 【性能优化】立即执行，不等待
        scanAndApply();
        // 启动属性变化监听
        watchAttributeChanges();
    };

    // 策略 A: 如果 DOM 已经加载完了，直接跑
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        runScanner();
    } else {
        // 策略 B: 如果还没加载完，等事件
        document.addEventListener('DOMContentLoaded', runScanner);
    }

    // 策略 C: 监听动态变化
    const observer = new MutationObserver(() => {
        scanAndApply();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.Pz = Pz;
}

export default Pz;