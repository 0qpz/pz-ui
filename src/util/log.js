// src/core/logger.js
import Config from "@/core/config.js";

const LEVEL_SCORES = {
    debug: 1,
    info: 2,
    warn: 3,
    error: 4
};

// 只定义文字颜色
const COLORS = {
    debug: '#909399', // 灰色
    info:  '#409EFF', // 蓝色
    warn:  '#E6A23C', // 橙色
    error: '#F56C6C'  // 红色
};

const Log = {
    _shouldLog(level) {
        if (Config.Get('debug') !== true) return false;
        const currentLevel = Config.Get('log');
        const currentScore = LEVEL_SCORES[currentLevel] || 2;
        const targetScore = LEVEL_SCORES[level] || 2;
        return targetScore >= currentScore;
    },

    /**
     * 简单获取调用位置 (文件名:行号)
     * 优化：清理掉 URL 中的查询参数（如 ?_ijt=...），让显示更干净
     */
    _getLocation() {
        const err = new Error();
        const stack = err.stack.split('\n');
        // 尝试获取第 4 或 5 行 (跳过 error, _getLocation, _print, public method)
        const line = stack[4] || stack[5];
        if (!line) return '';

        // 提取 file:line 部分
        const match = line.match(/([^)]+):\d+:\d+/);
        if (match) {
            let path = match[1];
            // 1. 只取文件名，去掉长路径
            let fileName = path.split('/').pop().split('\\').pop();

            // 2. 【新增】去掉 URL 查询参数 (如 ?_ijt=...)，只显示文件名:行号
            fileName = fileName.split('?')[0];

            // 再提取行号
            const lineMatch = line.match(/:(\d+):\d+/);
            const lineNo = lineMatch ? lineMatch[1] : '';
            return `${fileName}:${lineNo}`;
        }
        return '';
    },

    _print(level, message, ...args) {
        const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
        const location = this._getLocation();

        const color = COLORS[level] || '#333';
        const levelText = level.toUpperCase();

        // 选择对应的 console 方法
        const logFunc = level === 'error' ? console.error :
            level === 'warn' ? console.warn : console.log;

        // 🚀 核心修改：
        // 1. 主模板字符串只包含：[级别] + 时间 + 消息内容
        // 2. 位置信息作为额外的 %c 部分追加在最后

        // 如果存在位置信息，我们构建一个带样式的后缀
        let locationSuffix = '';
        let locationStyle = '';

        if (location) {
            locationSuffix = ` (${location})`;
            // 位置样式：淡灰色，斜体，区分于正文
            locationStyle = 'color: #aaa; font-style: italic; font-size: 0.9em;';
        }

        // 打印逻辑：
        // %c1 -> 级别标签 (彩色加粗)
        // %c2 -> 时间 + 空格 (淡灰色)
        // %c3 -> 用户消息 (默认黑色，支持对象展开)
        // %c4 -> 位置后缀 (淡灰色斜体，如果有)

        logFunc(
            `%c[${levelText}]%c ${time} %c${message}%c${locationSuffix}`,
            `color: ${color}; font-weight: bold;`,          // 1. 级别样式
            'color: #999; font-size: 0.9em;',               // 2. 时间样式
            'color: #FAFAFAFF;',                                 // 3. 消息样式 (保持默认黑，方便阅读)
            locationStyle                                   // 4. 位置样式
        );
    },

    debug(msg, ...args) { if (this._shouldLog('debug')) this._print('debug', msg, ...args); },
    info(msg,  ...args) { if (this._shouldLog('info'))  this._print('info',  msg, ...args); },
    warn(msg,  ...args) { if (this._shouldLog('warn'))  this._print('warn',  msg, ...args); },
    error(msg, ...args) { if (this._shouldLog('error')) this._print('error', msg, ...args); }
};

export default Log;