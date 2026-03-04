// src/pz-ui/parser.js

/**
 * 简化的解析器 - 只支持背景色映射
 * 用法：v-pz="background-fafafa" → background-color: #fafafa
 */
export function Parse(input) {
    // 如果没传内容，直接返回空对象，防止报错
    if (!input) return {};

    const result = {};

    // 检查是否是 background-xxx 格式
    if (typeof input === 'string' && input.startsWith('background-')) {
        // 提取颜色值，例如 "background-fafafa" → "fafafa"
        const colorValue = input.substring(11); // 去掉 "background-" 前缀
        
        // 如果是 6 位十六进制颜色（没有 #），加上 #
        if (/^[0-9a-fA-F]{6}$/.test(colorValue)) {
            result['background-color'] = '#' + colorValue;
        } else {
            // 否则直接使用原值
            result['background-color'] = colorValue;
        }
    }

    return result;
}
