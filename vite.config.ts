import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'
// 1. 注释掉这两个会导致构建失败的预渲染依赖
// import { seoperender } from "./ssr.config";
// import seoPrerender from 'vite-plugin-seo-prerender';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  let env = loadEnv(mode, process.cwd())
  return {
    define: {
      'process.env.NODE_ENV': JSON.stringify('production')
    },
    plugins: [
      // 2. 把预渲染插件直接注释掉
      // process.env.SKIP_PRERENDER !== 'true' && seoPrerender({}),
      vue(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        symbolId: 'icon-[dir]-[name]',
      }),
      // 3. 注释掉这个依赖
      // seoperender()
    ],
    resolve: {
      alias: {
        "@": path.resolve("./src")
      }
    },
    server: {
      host: env.VITE_HOST,
      proxy: {
        [env.VITE_APP_BASE_API]: {
          target: env.VITE_SERVE,
          changeOrigin: true,
        },
      }
    }
  }
})
