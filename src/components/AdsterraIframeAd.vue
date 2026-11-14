<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Adsterra iframe 隔离广告：加载 public 下的静态 html（内含 Adsterra 原始代码）。
 * 广告脚本运行在独立文档中，不注入主页面、不占用主页面的全局 atOptions；
 * sandbox 不含 allow-top-navigation，防止广告脚本劫持父页面导航。
 */
const props = defineProps<{
  /** 隔离页面地址（public 下的静态 html） */
  src: string
  /** 广告宽度（px），用于占位防抖动 */
  width: number
  /** 广告高度（px） */
  height: number
}>()

/** 广告渲染并加载完成后触发，供浮动容器决定何时显示广告框 */
const emit = defineEmits<{ (e: 'loaded'): void }>()

const frame = ref<HTMLIFrameElement>()

let observer: MutationObserver | undefined
let loadedEmitted = false

const notifyLoaded = () => {
  if (loadedEmitted) return
  loadedEmitted = true
  emit('loaded')
}

onMounted(() => {
  const iframe = frame.value
  if (!iframe) return

  // 外层 iframe 文档就绪后，监听其内部广告 iframe 的插入与加载完成
  iframe.addEventListener('load', () => {
    const doc = iframe.contentDocument
    if (!doc?.body) {
      // 文档不可读时降级：视外层加载完成为广告就绪
      notifyLoaded()
      return
    }
    observer = new MutationObserver(() => {
      const ad = doc.querySelector('iframe')
      if (ad) {
        ad.addEventListener('load', notifyLoaded, { once: true })
        // 同步加载的 iframe 可能在绑定前已完成 load，兜底检查
        try {
          if (ad.contentWindow?.document?.readyState === 'complete') notifyLoaded()
        } catch {
          // 跨域无法读取 readyState，等待 load 事件即可
        }
        observer?.disconnect()
      }
    })
    observer.observe(doc.body, { childList: true, subtree: true })
  }, { once: true })
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <iframe
    ref="frame"
    :src="props.src"
    title="Advertisement"
    sandbox="allow-scripts allow-same-origin allow-popups"
    class="mx-auto block border-0"
    :style="{ width: `${props.width}px`, height: `${props.height}px` }"
  ></iframe>
</template>
