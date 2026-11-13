<script setup lang="ts">
import { onMounted, ref } from 'vue'

// 容器占位尺寸，默认与广告实际尺寸一致，防止广告加载后页面抖动
const props = withDefaults(defineProps<{ width?: number; height?: number }>(), {
  width: 728,
  height: 90,
})

const adContainer = ref<HTMLDivElement>()

declare global {
  interface Window {
    atOptions?: Record<string, unknown>
  }
}

onMounted(() => {
  // Adsterra iframe 广告的全局配置，由 invoke 脚本读取
  window.atOptions = {
    'key': 'f7865f7ecbfae1e0b1f49b1ebdeb011f',
    'format': 'iframe',
    'height': 90,
    'width': 728,
    'params': {},
  }
  // 动态插入 invoke 脚本，由其在当前容器位置渲染广告 iframe
  const script = document.createElement('script')
  script.src = 'https://bauval.org/22/f7865f7ecbfae1e0b1f49b1ebdeb011f'
  adContainer.value?.appendChild(script)
})
</script>

<template>
  <div
    ref="adContainer"
    class="mx-auto my-5 flex justify-center overflow-hidden"
    :style="{ width: `${props.width}px`, height: `${props.height}px` }"
  ></div>
</template>
