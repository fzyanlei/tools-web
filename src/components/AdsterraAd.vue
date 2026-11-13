<script lang="ts">
// 模块级广告加载链：同一页面的多个广告位按顺序加载，
// 后一个等前一个脚本执行完毕再设置 window.atOptions，避免全局配置被覆盖。
let previousAdLoaded: Promise<void> = Promise.resolve()

declare global {
  interface Window {
    atOptions?: Record<string, unknown>
  }
}
</script>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  /** Adsterra 后台的广告位 key */
  adKey: string
  /** invoke 脚本地址（Adsterra 代码中 script 标签的 src） */
  scriptSrc: string
  /** 广告宽度（px），用于占位防抖动 */
  width: number
  /** 广告高度（px） */
  height: number
}>()

/** 广告 iframe 渲染并加载完成后触发，供浮动容器决定何时显示广告框 */
const emit = defineEmits<{ (e: 'loaded'): void }>()

const adContainer = ref<HTMLDivElement>()

let observer: MutationObserver | undefined
let loadedEmitted = false

const notifyLoaded = () => {
  if (loadedEmitted) return
  loadedEmitted = true
  emit('loaded')
}

onMounted(() => {
  // key 未配置的广告位（占位条目）跳过加载
  if (!props.adKey || !props.scriptSrc) return

  const container = adContainer.value
  if (!container) return

  // 广告 iframe 由 invoke 脚本异步插入：检测到 iframe 并等其加载完成后通知父级
  observer = new MutationObserver(() => {
    const iframe = container.querySelector('iframe')
    if (iframe) {
      iframe.addEventListener('load', notifyLoaded, { once: true })
      // 同步加载的 iframe（如 about:blank）可能在绑定前已完成 load，兜底检查
      try {
        if (iframe.contentWindow?.document?.readyState === 'complete') notifyLoaded()
      } catch {
        // 跨域 iframe 无法读取 readyState，等待 load 事件即可
      }
      observer?.disconnect()
    }
  })
  observer.observe(container, { childList: true, subtree: true })

  // 把本次加载接到队列末尾，保证 atOptions 的设置与脚本读取一一对齐
  const waitPrevious = previousAdLoaded
  previousAdLoaded = new Promise<void>((resolve) => {
    waitPrevious.then(() => {
      // Adsterra iframe 广告的全局配置，由 invoke 脚本在执行时读取
      window.atOptions = {
        'key': props.adKey,
        'format': 'iframe',
        'height': props.height,
        'width': props.width,
        'params': {},
      }
      // 动态插入 invoke 脚本，由其在当前容器位置渲染广告 iframe
      const script = document.createElement('script')
      script.src = props.scriptSrc
      // 无论成功失败都放行队列，避免阻塞后续广告位加载
      script.onload = () => resolve()
      script.onerror = () => resolve()
      // 极端情况（脚本挂起无回调）超时兜底放行
      setTimeout(resolve, 5000)
      adContainer.value?.appendChild(script)
    })
  })
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div
    ref="adContainer"
    class="mx-auto flex justify-center overflow-hidden"
    :style="{ width: `${props.width}px`, height: `${props.height}px` }"
  ></div>
</template>

<style scoped>
/* 广告 iframe 撑满占位容器，消除投放内容与占位之间的空隙 */
:deep(iframe) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
