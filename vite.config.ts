import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

// 彻底注释掉这两个会导致 Cloudflare 构建失败的预渲染依赖
// import { seoperender } from "./ssr.config";
// import seoPrerender from 'vite-plugin-seo-prerender';

// https://vitejs.dev/config/
export default defineConfig(({command, mode}) => {
  let env = loadEnv(mode, process.cwd())
  return {
    define: {  
      'process.env.NODE_ENV': JSON.stringify('production')  
    },
    plugins: [
      // 彻底注释掉预渲染插件
      // process.env.SKIP_PRERENDER !== 'true' && seoPrerender({ /* ... */ }),
      vue(),
      createSvgIconsPlugin({
        // Specify the icon folder to be cached
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        // Specify symbolId format
        symbolId: 'icon-[dir]-[name]',
      }),
      // seoperender()
    ],
    resolve: {
      alias: {
        "@": path.resolve("./src")  // 相对路径别名配置
      }
    },
    server: {
      host: env.VITE_HOST,
      proxy: {
        [env.VITE_APP_BASE_API] : {
          target: env.VITE_SERVE,
          changeOrigin: true,
        },
      }
    }
  }
})
