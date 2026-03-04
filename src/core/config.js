/*
 配置文件
 */

const _data = {
    debug : false,
    log : "info",
}

const ALLOWED_KEYS = ['log'];

// 定义需要过滤掉的“库文件”特征
// 只要路径里包含这些词，就认为是内部代码，继续往上找
const LIB_PATTERNS = [
    'pz-ui',
    'config.js',
    'node_modules',
    'vite',
    'webpack',
    'rollup',
    'chunk' // 有时候打包会生成 chunk-xxxx.js
];

function getCallerLocation() {
    const stack = new Error().stack;
    if (!stack) return "未知位置";

    const lines = stack.split('\n');

    // 标记：是否已经跳过了所有库文件
    let foundUserCode = false;

    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // 提取路径和行号
        const match = line.match(/\((.+):(\d+):(\d+)\)$/) || line.match(/at (.+):(\d+):(\d+)$/);

        if (match) {
            const fullPath = match[1] || match[4];
            const lineNum = match[2] || match[5];
            const fileName = fullPath.split('/').pop().split('\\').pop().split('?')[0];

            // 1. 过滤库文件
            const isLib = LIB_PATTERNS.some(p => fullPath.includes(p));
            if (isLib) {
                continue;
            }

            // 2. 特殊处理：Vue 运行时内部 (runtime-core, runtime-dom)
            // 如果路径包含这些，说明还没跳出框架层，继续找
            if (fullPath.includes('runtime-core') || fullPath.includes('runtime-dom')) {
                continue;
            }

            // 3. 特殊处理：内联脚本或匿名函数
            // 如果文件名是 empty, anonymous, 或者 HTML 文件本身
            if (fileName === 'anonymous' || fileName === 'empty' || fileName.endsWith('.html')) {
                // 尝试从上一行或下一行找线索，或者直接返回一个更有用的提示
                // 这里我们选择返回 HTML 文件名 + 行号（如果有）
                return `${fileName}:${lineNum} (内联脚本)`;
            }

            // 4. 找到用户代码了！
            // 如果是 .vue 文件，直接返回
            if (fileName.endsWith('.vue')) {
                return `${fileName}:${lineNum}`;
            }

            // 如果是 .js/.ts 文件，也返回
            return `${fileName}:${lineNum}`;
        }
    }

    // 如果循环结束都没找到（纯内联且无堆栈信息）
    // 尝试从堆栈文本中提取最后一点线索
    const lastClue = lines.find(l => l.includes('at HTML') || l.includes('at Proxy'));
    if (lastClue) {
        return `事件处理器 (${lastClue.trim().substring(0, 30)}...)`;
    }

    return "内联脚本 (请检查绑定该事件的组件)";
}

const Config = {
    Get(key) {
        return _data[key];
    },

    Debug() {
        _data.debug = true;
        const location = getCallerLocation();

        // 样式保持不变
        const unifiedStyle = [
            'background: #fffbe6',
            'color: #d32f2f',
            'padding: 6px 10px',
            'border-radius: 4px',
            'font-weight: bold',
            'font-family: Consolas, monospace',
            'border: 1px solid #ffc107',
            'font-size: 13px',
            'display: inline-block',
        ].join(';');

        const message = `⚠️ 调试模式已开启！上线前请移除，位置：${location}`;
        console.log(`%c ${message}`, unifiedStyle);
    },

    SetKey(key, value) { // 注意：这里建议统一驼峰命名 SetKey
        if (!ALLOWED_KEYS.includes(key)) {
            console.warn(`禁止修改配置：${key}`);
            return;
        }
        _data[key] = value;
        console.log(`已修改配置：${key} = ${value}`);
    }
};

export default Config;