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
import { onMounted, ref } from 'vue'

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

const adContainer = ref<HTMLDivElement>()

onMounted(() => {
  // key 未配置的广告位（占位条目）跳过加载
  if (!props.adKey || !props.scriptSrc) return

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
</script>

<template>
  <div
    ref="adContainer"
    class="mx-auto my-5 flex justify-center overflow-hidden"
    :style="{ width: `${props.width}px`, height: `${props.height}px` }"
  ></div>
</template>
