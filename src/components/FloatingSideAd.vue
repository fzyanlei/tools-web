<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'
import AdsterraIframeAd from '@/components/AdsterraIframeAd.vue'
import { adSlots } from '@/components/ads'
import { useAdReveal } from '@/components/useAdReveal'

/** 关闭按钮出现前的倒计时秒数 */
const COUNTDOWN_SECONDS = 10

const { adLoaded, visible, countdown, onLoaded, close } = useAdReveal(COUNTDOWN_SECONDS)
</script>

<template>
  <!-- 桌面端详情页右侧悬浮矩形广告：垂直居中贴右侧 -->
  <div v-if="visible" class="pointer-events-none fixed top-1/2 right-4 z-40 -translate-y-1/2">
    <div
      class="pointer-events-auto relative rounded-xl bg-white p-1 shadow-[0_4px_16px_rgba(0,0,0,0.18)] transition-opacity duration-300"
      :class="adLoaded ? 'opacity-100' : 'pointer-events-none opacity-0'"
    >
      <AdsterraIframeAd v-if="adSlots.rectangle.src" v-bind="adSlots.rectangle" @loaded="onLoaded" />
      <!-- 倒计时结束前显示剩余秒数，结束后变为可点击的关闭按钮 -->
      <button
        v-if="adLoaded && countdown <= 0"
        type="button"
        aria-label="关闭广告"
        title="关闭广告"
        class="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
        @click="close"
      >
        <el-icon :size="14"><Close /></el-icon>
      </button>
      <span
        v-else-if="adLoaded"
        class="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-xs text-white"
      >
        {{ countdown }}
      </span>
    </div>
  </div>
</template>
