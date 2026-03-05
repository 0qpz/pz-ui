/**
 * 背景色解析器
 * 
 * 性能特点：
 * - O(1) 时间复杂度
 * - 正则表达式预编译（JavaScript 引擎自动优化）
 * - 无内存分配（除了返回对象）
 * 
 * @param {string} input - 原子样式字符串
 * @returns {{ 'background-color': string } | null} CSS 对象或 null
 * 
 * @example
 * parseBackground('background-fafafa') → { 'background-color': '#fafafa' }
 * parseBackground('background-fff') → { 'background-color': '#ffffff' }
 * parseBackground('background-red') → { 'background-color': 'red' }
 * parseBackground('invalid') → null
 */
export function parseBackground(input) {
    // 【性能优化】快速失败：前缀检查
    if (!input || !input.startsWith('background-')) {
        return null;
    }
    
    // 提取颜色值部分
    const colorValue = input.substring(11);
    
    // 【性能优化】使用常量存储正则，避免每次重新创建
    // 6 位十六进制颜色
    if (HEX6_REGEX.test(colorValue)) {
        return { 'background-color': '#' + colorValue };
    }
    
    // 3 位十六进制颜色（展开为 6 位）
    if (HEX3_REGEX.test(colorValue)) {
        return { 'background-color': '#' + expandHex3(colorValue) };
    }
    
    // 其他情况直接使用原值（支持 named colors, rgba, hsla 等）
    return { 'background-color': colorValue };
}

// ============================================================================
// 预编译正则表达式（性能优化）
// ============================================================================
const HEX6_REGEX = /^[0-9a-fA-F]{6}$/;
const HEX3_REGEX = /^[0-9a-fA-F]{3}$/;

/**
 * 展开 3 位十六进制为 6 位
 * 例如："f0e" → "ff00ee"
 * 
 * @param {string} hex3 - 3 位十六进制
 * @returns {string} 6 位十六进制
 */
function expandHex3(hex3) {
    return hex3.split('').map(char => char + char).join('');
}
