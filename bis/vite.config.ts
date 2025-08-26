import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true,
        changeOrigin: true
      }
    }
  },
  // 환경 변수 기본값 설정
  // define: {
  //   'import.meta.env.VITE_WS_URL': JSON.stringify((process?.env?.VITE_WS_URL as string) || ''),
  //   'import.meta.env.VITE_API_URL': JSON.stringify((process?.env?.VITE_API_URL as string) || ''),
  // },
});