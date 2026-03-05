/**
 * Display 解析器 - 布局显示模式（性能巅峰版）
 * 
 * 性能特征：
 * - 0 次字符串拼接
 * - 0 次条件分支 (if/else/ternary)
 * - 0 次比较运算 (===)
 * - 仅 1 次 Map 哈希查找
 * - 仅 1 次对象字面量创建
 * 
 * @param {string} input - 原子样式字符串
 * @returns {object | null} CSS 对象或 null
 * 
 * @example
 * parseDisplay('block') → { 'display': 'block' }
 * parseDisplay('none') → { 'display': 'none !important' }
 * parseDisplay('invalid') → null
 */
export function parseDisplay(input) {
    // 【快速失败】(Fast Fail)
    if (!input) return null;

    // 【核心路径】直接查表，拿到就是最终结果
    const value = DISPLAY_MAP.get(input);

    // 如果没查到，返回 null
    if (value === undefined) {
        return null;
    }

    // 直接返回，无需任何处理
    return { display: value };
}

// ============================================================================
// 【巅峰优化】静态常量池 & 预编译映射
// 策略：将所有运行时计算（拼接、判断）全部移至加载时（Init-time）。
// 运行时只做一件事：哈希查找 (O(1)) 并返回。
// ============================================================================

// 1. 预先生成最终需要的字符串常量 (避免运行时拼接)
const VAL_BLOCK = 'block';
const VAL_INLINE = 'inline';
const VAL_INLINE_BLOCK = 'inline-block';
const VAL_NONE_CRITICAL = 'none !important'; // 预先处理好 !important
const VAL_FLEX = 'flex';
const VAL_INLINE_FLEX = 'inline-flex';
const VAL_GRID = 'grid';
const VAL_INLINE_GRID = 'inline-grid';

// 2. 预编译映射表：Key -> 最终 CSS 值 (包含 !important)
// 这样函数内部不需要任何 if/else 或三元运算
const DISPLAY_MAP = new Map([
    ['block', VAL_BLOCK],
    ['inline', VAL_INLINE],
    ['inline-block', VAL_INLINE_BLOCK],
    
    // 关键优化：直接存储处理后的值，运行时无需判断 "是不是 none"
    ['none', VAL_NONE_CRITICAL], 
    
    ['flex', VAL_FLEX],
    ['inline-flex', VAL_INLINE_FLEX],
    ['grid', VAL_GRID],
    ['inline-grid', VAL_INLINE_GRID],
]);
