<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { Close } from '@element-plus/icons-vue'
import AdsterraAd from '@/components/AdsterraAd.vue'
import { adSlots } from '@/components/ads'

/** 关闭按钮出现前的倒计时秒数（与视频贴片"N 秒后可跳过"同款的合规曝光模式） */
const COUNTDOWN_SECONDS = 10

const visible = ref(true)
const countdown = ref(COUNTDOWN_SECONDS)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0 && timer) clearInterval(timer)
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const close = () => {
  visible.value = false
}
</script>

<template>
  <!-- 外层只负责贴底水平居中；两侧透明区域不拦截页面点击 -->
  <div class="pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex justify-center">
    <Transition name="ad-bar">
      <div v-if="visible" class="pointer-events-auto relative">
        <!-- 广告容器：宽度收缩为广告本身大小，两侧不再有整行留白 -->
        <div
          class="floating-ad-bar overflow-hidden rounded-t-xl bg-white px-1 pt-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(0,0,0,0.18)]"
        >
          <!-- 桌面端横幅 728x90 -->
          <div v-if="adSlots.desktopBanner.adKey" class="c-xs:hidden">
            <AdsterraAd v-bind="adSlots.desktopBanner" />
          </div>
          <!-- 手机端横幅 320x50 -->
          <div v-if="adSlots.mobileBanner.adKey" class="hidden c-xs:block">
            <AdsterraAd v-bind="adSlots.mobileBanner" />
          </div>
        </div>
        <!-- 倒计时结束前显示剩余秒数，结束后变为可点击的关闭按钮 -->
        <button
          v-if="countdown <= 0"
          type="button"
          aria-label="关闭广告"
          title="关闭广告"
          class="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
          @click="close"
        >
          <el-icon :size="14"><Close /></el-icon>
        </button>
        <span
          v-else
          class="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-xs text-white"
        >
          {{ countdown }}
        </span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 浮条滑入滑出 */
.ad-bar-enter-active,
.ad-bar-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.ad-bar-enter-from,
.ad-bar-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
