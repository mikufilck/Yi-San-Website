import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Yi-San-Website/',
  server: {
    port: 3000,
    host: true, // 允许局域网 IP 访问
    proxy: {
      // 1. 代理所有 API 请求
      '/api': {
        target: 'http://127.0.0.1:8000', // 使用 127.0.0.1 避开某些系统的本地解析延迟
        changeOrigin: true,
        // 后端 main.py 统一带 /api 前缀，故不需要 rewrite
      },
      // 2. 核心修复：代理静态资源
      // 你的后端返回路径是 /uploads/xxx.webp，所以这里必须拦截 /uploads
      '/uploads': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  },
  // 生产环境打包配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // 生产环境关闭 sourcemap 防止源码泄露
    minify: 'esbuild', // 启用压缩
  }

});

