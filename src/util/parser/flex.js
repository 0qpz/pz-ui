/**
 * Flexbox 解析器 - 弹性布局（性能巅峰版）
 * 
 * 性能特征：
 * - 0 次字符串拼接
 * - 仅 1 次前缀检查 (startsWith)
 * - 最多 6 次 Map 哈希查找（实际平均 <2 次）
 * - 仅 1 次对象字面量创建
 * 
 * 命名规范：fx-xxx
 * - fx-row: flex-direction: row
 * - fx-rows: flex-direction: row-reverse
 * - fx-col: flex-direction: column
 * - fx-cols: flex-direction: column-reverse
 * - fx-wrap: flex-wrap: wrap
 * - fx-wraps: flex-wrap: wrap-reverse
 * - fx-nowrap: flex-wrap: nowrap
 * - fx-jc-xxx: justify-content
 * - fx-ai-xxx: align-items
 * - fx-ac-xxx: align-content
 * - fx-grow-N: flex-grow: N (N 为 0-9 的整数)
 * 
 * @param {string} input - 原子样式字符串
 * @returns {object | null} CSS 对象或 null
 */
export function parseFlex(input) {
    // 【快速失败】(Fast Fail)
    if (!input || !input.startsWith('fx-')) {
        return null;
    }

    // 【核心路径】依次查表，命中即返回
    // 按调用频率排序：Direction > Wrap > JC > Grow > AI > AC
    let value = FLEX_DIRECTION_MAP.get(input);
    if (value !== undefined) return { 'flex-direction': value };
    
    value = FLEX_WRAP_MAP.get(input);
    if (value !== undefined) return { 'flex-wrap': value };
    
    value = JUSTIFY_CONTENT_MAP.get(input);
    if (value !== undefined) return { 'justify-content': value };
    
    // 【特殊处理】fx-grow-N 动态值解析
    value = parseFlexGrow(input);
    if (value !== null) return { 'flex-grow': value };
    
    value = ALIGN_ITEMS_MAP.get(input);
    if (value !== undefined) return { 'align-items': value };
    
    value = ALIGN_CONTENT_MAP.get(input);
    if (value !== undefined) return { 'align-content': value };
    
    return null;
}

// ============================================================================
// 【巅峰优化】静态常量池 & 预编译映射
// 策略：将所有运行时计算移至加载时，运行时只做哈希查找
// ============================================================================

// 预编译正则（只创建一次，性能优化）
// 支持：fx-grow (默认 1) 或 fx-grow-N (N 为任意正整数)
const GROW_REGEX = /^fx-grow(?:-(\d+))?$/;

// Flex Direction - 预定义常量
const VAL_ROW = 'row';
const VAL_ROW_REVERSE = 'row-reverse';
const VAL_COLUMN = 'column';
const VAL_COLUMN_REVERSE = 'column-reverse';

// Flex Wrap - 预定义常量
const VAL_WRAP = 'wrap';
const VAL_WRAP_REVERSE = 'wrap-reverse';
const VAL_NOWRAP = 'nowrap';

// Justify Content - 预定义常量
const VAL_FLEX_START = 'flex-start';
const VAL_FLEX_END = 'flex-end';
const VAL_CENTER = 'center';
const VAL_SPACE_BETWEEN = 'space-between';
const VAL_SPACE_AROUND = 'space-around';
const VAL_SPACE_EVENLY = 'space-evenly';

// Align Items - 预定义常量
const VAL_STRETCH = 'stretch';
const VAL_BASELINE = 'baseline';

// Align Content - 预定义常量
const VAL_AC_START = 'flex-start';
const VAL_AC_END = 'flex-end';
const VAL_AC_CENTER = 'center';
const VAL_AC_BETWEEN = 'space-between';
const VAL_AC_AROUND = 'space-around';
const VAL_AC_STRETCH = 'stretch';

// Flex Direction
const FLEX_DIRECTION_MAP = new Map([
    ['fx-row', VAL_ROW],
    ['fx-rows', VAL_ROW_REVERSE],
    ['fx-col', VAL_COLUMN],
    ['fx-cols', VAL_COLUMN_REVERSE],
]);

// Flex Wrap
const FLEX_WRAP_MAP = new Map([
    ['fx-wrap', VAL_WRAP],
    ['fx-wraps', VAL_WRAP_REVERSE],
    ['fx-nowrap', VAL_NOWRAP],
]);

// Justify Content
const JUSTIFY_CONTENT_MAP = new Map([
    ['fx-jc-start', VAL_FLEX_START],
    ['fx-jc-end', VAL_FLEX_END],
    ['fx-jc-center', VAL_CENTER],
    ['fx-jc-between', VAL_SPACE_BETWEEN],
    ['fx-jc-around', VAL_SPACE_AROUND],
    ['fx-jc-evenly', VAL_SPACE_EVENLY],
]);

// Align Items
const ALIGN_ITEMS_MAP = new Map([
    ['fx-ai-start', VAL_FLEX_START],
    ['fx-ai-end', VAL_FLEX_END],
    ['fx-ai-center', VAL_CENTER],
    ['fx-ai-stretch', VAL_STRETCH],
    ['fx-ai-baseline', VAL_BASELINE],
]);

// Align Content
const ALIGN_CONTENT_MAP = new Map([
    ['fx-ac-start', VAL_AC_START],
    ['fx-ac-end', VAL_AC_END],
    ['fx-ac-center', VAL_AC_CENTER],
    ['fx-ac-between', VAL_AC_BETWEEN],
    ['fx-ac-around', VAL_AC_AROUND],
    ['fx-ac-stretch', VAL_AC_STRETCH],
]);

/**
 * 解析 flex-grow 动态值
 * 支持：
 *   - fx-grow     → flex-grow: 1 (默认值)
 *   - fx-grow-0   → flex-grow: 0
 *   - fx-grow-1   → flex-grow: 1
 *   - fx-grow-2   → flex-grow: 2
 *   - ... fx-grow-N
 * 
 * @param {string} input - 输入字符串
 * @returns {string | null} flex-grow 值或 null
 */
function parseFlexGrow(input) {
    // 【性能优化】使用预编译正则快速匹配
    const match = GROW_REGEX.exec(input);
    if (match) {
        // 如果捕获组为 undefined，说明是 fx-grow（无数字），返回默认值 '1'
        // 否则返回捕获的数字字符串
        return match[1] !== undefined ? match[1] : '1';
    }
    return null;
}
