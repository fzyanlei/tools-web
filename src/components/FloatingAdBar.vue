<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'
import AdsterraIframeAd from '@/components/AdsterraIframeAd.vue'
import { adSlots } from '@/components/ads'
import { useAdReveal } from '@/components/useAdReveal'

/** 关闭按钮出现前的倒计时秒数（与视频贴片"N 秒后可跳过"同款的合规曝光模式） */
const COUNTDOWN_SECONDS = 10

const { adLoaded, visible, countdown, onLoaded, close } = useAdReveal(COUNTDOWN_SECONDS)
</script>

<template>
  <!-- 外层只负责贴底水平居中；两侧透明区域不拦截页面点击 -->
  <div v-if="visible" class="pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex justify-center">
    <div class="pointer-events-auto relative">
      <!-- 广告框：广告加载完成前保持透明不可见，加载完成后淡入；
           floating-ad-bar 类同时控制 body 底部占位，未加载时不占用空间 -->
      <div
        class="overflow-hidden rounded-t-xl bg-white px-1 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.18)] transition-opacity duration-300"
        :class="adLoaded ? 'floating-ad-bar opacity-100' : 'pointer-events-none opacity-0'"
      >
        <!-- 桌面端横幅 728x90 -->
        <div v-if="adSlots.desktopBanner.src" class="c-xs:hidden">
          <AdsterraIframeAd v-bind="adSlots.desktopBanner" @loaded="onLoaded" />
        </div>
        <!-- 手机端横幅 320x50 -->
        <div v-if="adSlots.mobileBanner.src" class="hidden c-xs:block">
          <AdsterraIframeAd v-bind="adSlots.mobileBanner" @loaded="onLoaded" />
        </div>
      </div>
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
