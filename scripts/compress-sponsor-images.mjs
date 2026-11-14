/**
 * 压缩赞助弹窗二维码图片：缩放到 2x retina 尺寸并转 WebP。
 * 用法：node scripts/compress-sponsor-images.mjs
 * 输入 public/images/{wx,zfb}.png，输出同名 .webp。
 */
import sharp from 'sharp'
import { statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const imgDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/images')

const tasks = [
  { input: 'wx.png', output: 'wx.webp' },
  { input: 'zfb.png', output: 'zfb.webp' },
]

for (const { input, output } of tasks) {
  const src = path.join(imgDir, input)
  const dest = path.join(imgDir, output)
  // 弹窗中显示为 200px 见方，缩放到高度 400（2x retina）足够清晰
  const info = await sharp(src)
    .resize({ height: 400, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(dest)
  console.log(`${input} -> ${output}: ${(statSync(src).size / 1024).toFixed(1)}KB -> ${(info.size / 1024).toFixed(1)}KB (${info.width}x${info.height})`)
}
