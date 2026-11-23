import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 相对路径基址：构建产物可在服务器任意目录（含子目录）直接部署，
  // 也支持本地 file:// 双击预览（module 脚本除外）
  base: './',
})
