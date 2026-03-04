import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    server: {
        port: 5173,
        open: false, // 建议手动打开测试页，避免自动打开不存在的页面报错
        host: true
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        lib: {
            // 入口文件
            entry: resolve(__dirname, 'src/main.js'),
            // 全局变量名：HTML 中将可以通过 window.PZ 访问
            name: 'Pz',
            // 输出格式：iife 是为了生成浏览器可直接运行的脚本
            formats: ['iife', 'es'],
            // 文件名定制
            fileName: (format) => {
                if (format === 'es') return 'pz-ui.es.js';
                return 'pz-ui.js'; // iife 格式生成的文件名
            }
        },
        // 关闭 CSS 代码分割，确保样式内联或单独处理（视需求而定，组件库通常建议 false 或提取）
        cssCodeSplit: false,
        // 压缩代码 (terser 需要额外安装，先用默认的 esbuild 更快更稳)
        minify: 'esbuild',
        sourcemap: true,
        rollupOptions: {
            // 如果有外部依赖（如 vue），在这里排除，但原生组件库通常不需要
            external: [],
            output: {
                // 确保没有外部依赖时，全局变量命名正确
                globals: {}
            }
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src')
        }
    }
});