import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'
import {seoperender} from "./ssr.config";

// vite.config.ts
import seoPrerender from 'vite-plugin-seo-prerender';

export default defineConfig({
  plugins: [
    // 只有当 SKIP_PRERENDER 环境变量不为 'true' 时才启用预渲染
    process.env.SKIP_PRERENDER !== 'true' && seoPrerender({ /* ... */ }),
  ],
});

// https://vitejs.dev/config/
export default defineConfig(({command, mode}) => {
  let env = loadEnv(mode, process.cwd())
  return {
    define: {  
      'process.env.NODE_ENV': JSON.stringify('production')  
    },
    plugins: [
      vue(),
      createSvgIconsPlugin({
        // Specify the icon folder to be cached
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        // Specify symbolId format
        symbolId: 'icon-[dir]-[name]',
      }),
      seoperender()
    ],
    resolve: {
      alias: {
        "@": path.resolve("./src")  //相对路径别名配置， 使用@替代src
      }
    },
    server: {
      host: env.VITE_HOST,
      proxy: {
        [env.VITE_APP_BASE_API] : {
          target: env.VITE_SERVE,
          changeOrigin: true,
          // bypass(req, res, options) {
          //   const proxyUrl = new URL(options.rewrite(req.url) || '', (options.target) as string)?.href || ''
          //   req.headers['x-req-proxyUrl'] = proxyUrl;
          //   res.setHeader("x-res-proxyUrl", proxyUrl)
          // }
        },
        
      }
    }
  }
})
