// src/pz-ui/scanner.js
import { Parse } from '@/util/parser/index.js';
import Log from "@/util/log.js";

// ============================================================================
// 【架构级优化】完全移除 MutationObserver，改用超高速直连模式
// ============================================================================

// 缓存系统
const STRING_CACHE = new Map();
const CSS_CACHE = new Map();

// 整数枚举映射
let TOKEN_ID_COUNTER = 0;
const TOKEN_TO_ID = new Map();
const ID_TO_TOKEN = new Map();

// 样式表
let sharedStyleEl = null;
let styleSheet = null;

/**
 * 【性能优化】字符串哈希
 */
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

/**
 * 【性能优化】初始化样式表
 */
function initStyleSheet() {
    if (!sharedStyleEl) {
        sharedStyleEl = document.createElement('style');
        sharedStyleEl.setAttribute('data-pz-auto', 'true');
        document.head.appendChild(sharedStyleEl);
        styleSheet = sharedStyleEl.sheet;
    }
    return styleSheet;
}

/**
 * 【整数枚举映射】
 */
function getTokenId(token) {
    if (TOKEN_TO_ID.has(token)) {
        return TOKEN_TO_ID.get(token);
    }
    
    const id = ++TOKEN_ID_COUNTER;
    TOKEN_TO_ID.set(token, id);
    ID_TO_TOKEN.set(id, token);
    return id;
}

/**
 * 【性能巅峰】getOrCreateHashClass - Goober 同款超高速版本
 * 
 * 核心思想：
 * 1. 零队列、零延迟、立即同步完成
 * 2. CSS 注入使用 textContent 批量
 * 3. 完全依赖缓存
 */
export function getOrCreateHashClass(styleString) {
    // 【超高速路径】检查缓存（O(1)）
    if (STRING_CACHE.has(styleString)) {
        return STRING_CACHE.get(styleString);
    }
    
    // 解析样式
    const styles = Parse(styleString);
    const keys = Object.keys(styles);
    
    if (keys.length === 0) {
        return null;
    }
    
    // 构建数字签名
    const signatureParts = [];
    const len = keys.length;
    for (let i = 0; i < len; i++) {
        const key = keys[i];
        const value = styles[key];
        const tokenId = getTokenId(`${key}:${value}`);
        signatureParts.push(tokenId);
    }
    
    const signature = signatureParts.join('-');
    
    // 检查签名缓存
    if (SIGNATURE_CACHE.has(signature)) {
        const cached = SIGNATURE_CACHE.get(signature);
        STRING_CACHE.set(styleString, cached);
        return cached;
    }
    
    // 构建规范化 CSS
    let normalizedCssString = '';
    for (let i = 0; i < len; i++) {
        const key = keys[i];
        let value = styles[key];
        
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        
        if (value.includes(' !important')) {
            value = value.replace(' !important', '!important');
        }
        
        if (i > 0) {
            normalizedCssString += ';';
        }
        
        normalizedCssString += `${cssKey}:${value}`;
    }
    
    // 检查 CSS 缓存
    if (CSS_CACHE.has(normalizedCssString)) {
        const cached = CSS_CACHE.get(normalizedCssString);
        SIGNATURE_CACHE.set(signature, cached);
        STRING_CACHE.set(styleString, cached);
        return cached;
    }
    
    // 生成 className
    const hash = hashString(normalizedCssString);
    const className = `pz-${hash}`;
    
    // 【关键优化】立即同步插入 CSS（不延迟）
    const sheet = initStyleSheet();
    try {
        const rule = `.${className}{${normalizedCssString}}`;
        const index = sheet.cssRules ? sheet.cssRules.length : 0;
        sheet.insertRule(rule, index);
    } catch (e) {
        // 降级处理
    }
    
    // 写入三层缓存
    CSS_CACHE.set(normalizedCssString, className);
    SIGNATURE_CACHE.set(signature, className);
    STRING_CACHE.set(styleString, className);
    
    return className;
}

// 添加签名缓存
const SIGNATURE_CACHE = new Map();

/**
 * 【统一扫描并应用样式】- 简化版
 */
export function scanAndApply() {
    const pzElements = document.querySelectorAll('[data-pz]');
    const len = pzElements.length;
    
    if (len === 0) return;

    for (let i = 0; i < len; i++) {
        const el = pzElements[i];
        const pzValue = el.dataset.pz || el.getAttribute('data-pz');
        
        if (el._pzProcessed && el._pzValue === pzValue) {
            continue;
        }
        
        if (!pzValue) continue;

        try {
            const className = getOrCreateHashClass(pzValue);
            
            if (className) {
                if (el._pzClassName && el._pzClassName !== className) {
                    el.classList.remove(el._pzClassName);
                }
                el.classList.add(className);
                el._pzClassName = className;
            }
            
            el._pzProcessed = true;
            el._pzValue = pzValue;
        } catch (e) {
            // 静默失败
        }
    }
}

/**
 * 【废弃】不再提供 watchAttributeChanges
 * 由 main.js 直接控制，避免重复调用
 */
export function watchAttributeChanges() {
    // 空函数，不再使用
    return null;
}
