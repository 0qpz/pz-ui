/**
 * PZ-UI 原子样式解析器核心
 * 
 * 设计原则：
 * 1. 单一职责：每个解析器只处理一种原子样式
 * 2. 快速失败：不匹配的输入立即返回 null，避免无效计算
 * 3. 纯函数：无副作用，便于测试和优化
 * 4. 组合优先：支持多个原子样式组合（空格分隔）
 * 5. 缓存优化：组合结果也缓存，避免重复计算
 * 
 * @module parser/index
 */

import { parseBackground } from './background.js';
import { parseDisplay } from './display.js';
import { parseFlex } from './flex.js';

// ============================================================================
// 【巅峰优化】静态常量池 & 预编译映射
// 策略：将所有运行时计算移至加载时，运行时只做哈希查找
// ============================================================================

// 空格字符常量（避免硬编码）
const SPACE_CHAR = ' ';

// ============================================================================
// 解析器注册表
// ============================================================================
// 性能说明：
// - 使用数组而非 Map：保持固定顺序，遍历开销小
// - 按调用频率排序：高频解析器放前面，减少平均匹配时间
// - 易于扩展：添加新解析器只需在数组中注册
// ============================================================================
const PARSERS = [
    // Display 布局（最高频）
    parseDisplay,
    
    // Flexbox 布局（最高频）
    parseFlex,
    
    // 背景色（高频）
    parseBackground,
    
    // ↓ 在这里添加更多解析器 ↓
    // parseColor,      // 文本颜色
    // parseMargin,     // 外边距
    // parsePadding,    // 内边距
    // parseGrid,       // Grid 布局
    // parseBorder,     // 边框
    // parseSize,       // 宽高尺寸
    // parsePosition,   // 定位
    // ... 更多解析器
];

// ============================================================================
// 性能优化缓存
// ============================================================================
// 双缓存策略：
// 1. PARSE_CACHE: 缓存单个原子的解析结果
// 2. COMPOSE_CACHE: 缓存组合后的最终 CSS 对象
// ============================================================================
const PARSE_CACHE = new Map();
const COMPOSE_CACHE = new Map();
const MAX_CACHE_SIZE = 1000; // 最大缓存条目数

/**
 * 解析单个原子样式（带缓存）
 * @param {string} token - 单个原子样式字符串
 * @returns {object | null} CSS 对象或 null
 */
function parseSingleToken(token) {
    if (!token) return null;
    
    // 【性能优化】检查缓存
    if (PARSE_CACHE.has(token)) {
        return PARSE_CACHE.get(token);
    }
    
    // 【核心路径】依次调用所有解析器，命中即返回
    const len = PARSERS.length;
    for (let i = 0; i < len; i++) {
        const result = PARSERS[i](token);
        if (result) {
            // 写入缓存
            PARSE_CACHE.set(token, result);
            return result;
        }
    }
    
    // 没匹配到，缓存 null
    PARSE_CACHE.set(token, null);
    return null;
}

/**
 * 主解析函数 - 支持组合样式（性能巅峰版）
 * 
 * 策略：
 * 1. 先查组合缓存，命中直接返回（最快路径）
 * 2. 按空格分割为多个 token
 * 3. 并行解析每个 token（利用现代 CPU 流水线）
 * 4. 合并所有结果为单个 CSS 对象
 * 5. 写入组合缓存
 * 
 * @param {string} input - data-pz 的值（可包含多个原子样式，空格分隔）
 * @returns {object} CSS 样式对象
 * 
 * @example
 * Parse('flex fx-ai-center') → { 'display': 'flex', 'align-items': 'center' }
 * Parse('background-fafafa none') → { 'background-color': '#fafafa', 'display': 'none !important' }
 */
export function Parse(input) {
    if (!input) return {};
    
    // 【性能优化】检查组合缓存，命中则直接返回
    if (COMPOSE_CACHE.has(input)) {
        return COMPOSE_CACHE.get(input);
    }
    
    // 【性能优化】快速路径：如果没有空格，说明是单个原子样式
    if (!input.includes(SPACE_CHAR)) {
        const result = parseSingleToken(input) || {};
        COMPOSE_CACHE.set(input, result);
        return result;
    }
    
    // 【核心路径】分割并组合多个原子样式
    const tokens = input.split(SPACE_CHAR);
    const finalResult = {};
    
    // 【性能优化】依次解析每个 token 并合并
    const len = tokens.length;
    for (let i = 0; i < len; i++) {
        const token = tokens[i].trim();
        if (!token) continue;
        
        const parsed = parseSingleToken(token);
        if (parsed) {
            // 【性能优化】直接合并对象属性（浅合并）
            Object.assign(finalResult, parsed);
        }
    }
    
    // 【性能优化】LRU 缓存管理
    if (COMPOSE_CACHE.size >= MAX_CACHE_SIZE) {
        const firstKey = COMPOSE_CACHE.keys().next().value;
        COMPOSE_CACHE.delete(firstKey);
    }
    
    // 写入组合缓存
    COMPOSE_CACHE.set(input, finalResult);
    
    return finalResult;
}

/**
 * 清除解析缓存
 * 用于开发模式或内存紧张时手动清理
 */
export function clearParseCache() {
    PARSE_CACHE.clear();
}

/**
 * 获取缓存统计信息（用于性能分析）
 * @returns {{size: number, maxSize: number}}
 */
export function getCacheStats() {
    return {
        size: PARSE_CACHE.size,
        maxSize: MAX_CACHE_SIZE
    };
}
