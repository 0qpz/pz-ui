// src/pz-ui/scanner.js
import { Parse } from '@/util/parser.js';
import Log from "@/util/log.js";

// 【性能优化】哈希映射：样式字符串 → className
const styleHashCache = new Map(); // 'flex;gap:2' -> 'pz-h1a2b3c'
let sharedStyleEl = null;

/**
 * 【性能优化】简单的字符串哈希函数
 */
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36); // 转为 base36 缩短长度
}

/**
 * 【性能优化】获取共享 style 标签
 */
function getSharedStyleElement() {
    if (!sharedStyleEl) {
        sharedStyleEl = document.createElement('style');
        sharedStyleEl.setAttribute('data-pz-auto', 'true');
        document.head.appendChild(sharedStyleEl);
    }
    return sharedStyleEl;
}

/**
 * 【性能优化】根据样式哈希生成或获取 className
 */
export function getOrCreateHashClass(styleString) {
    // 计算哈希
    const hash = hashString(styleString);
    const className = `pz-${hash}`;
    
    // 检查是否已存在
    if (styleHashCache.has(styleString)) {
        return styleHashCache.get(styleString);
    }
    
    // 解析样式
    const styles = Parse(styleString);
    const styleEntries = Object.entries(styles);
    
    if (styleEntries.length === 0) {
        return null;
    }
    
    // 构建 CSS 规则
    const cssRules = styleEntries.map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}:${value}`;
    }).join(';');
    
    // 追加到共享 style 标签
    const styleEl = getSharedStyleElement();
    styleEl.textContent += `.${className}{${cssRules}}`;
    
    // 缓存
    styleHashCache.set(styleString, className);
    
    return className;
}

/**
 * 统一扫描并应用样式（HTML 和 Vue 共用）
 */
export function scanAndApply() {
    // 【性能优化】快速路径：如果没有新元素，直接返回
    const pzElements = document.querySelectorAll('[data-pz]');
    const len = pzElements.length;
    
    if (len === 0) {
        return;
    }

    // 【性能优化】使用普通 for 循环 + 长度缓存
    for (let i = 0; i < len; i++) {
        const el = pzElements[i];
        const pzValue = el.dataset.pz || el.getAttribute('data-pz');
        
        // 【性能优化】快速路径：跳过已处理且值未变的元素
        if (el._pzProcessed && el._pzValue === pzValue) {
            continue;
        }
        
        if (!pzValue) continue;

        try {
            // 【性能优化】使用哈希 class，相同样式完全复用
            const className = getOrCreateHashClass(pzValue);
            
            if (className) {
                // 移除旧的 Pz class
                if (el._pzClassName && el._pzClassName !== className) {
                    el.classList.remove(el._pzClassName);
                }
                // 添加新的 hash class
                el.classList.add(className);
                el._pzClassName = className;
            }
            
            // 标记为已处理，并保存当前值
            el._pzProcessed = true;
            el._pzValue = pzValue;
        } catch (e) {
            // 静默失败
        }
    }
}

/**
 * 监听属性变化：统一监听 data-pz 属性（HTML 和 Vue 共用）
 */
export function watchAttributeChanges() {
    // 【性能优化】使用防抖，避免频繁触发
    let isProcessing = false;
    
    const observer = new MutationObserver((mutations) => {
        if (isProcessing) return;
        
        let needsRescan = false;
        
        // 【性能优化】批量处理 mutations
        for (let i = 0; i < mutations.length; i++) {
            const mutation = mutations[i];
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-pz') {
                needsRescan = true;
                const el = mutation.target;
                const newValue = el.dataset.pz || el.getAttribute('data-pz');
                
                // 清除该元素的处理标记，强制重新解析
                if (newValue !== el._pzValue) {
                    el._pzProcessed = false;
                }
            }
        }
        
        if (needsRescan) {
            isProcessing = true;
            // 使用 microtask 而非 macrotask，响应更快
            Promise.resolve().then(() => {
                scanAndApply();
                isProcessing = false;
            });
        }
    });
    
    // 监听整个文档的 data-pz 属性变化
    observer.observe(document.documentElement, {
        attributes: true,
        subtree: true
    });
    
    return observer;
}
