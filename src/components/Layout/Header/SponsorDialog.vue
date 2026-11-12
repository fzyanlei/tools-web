<script setup lang="ts">
import { t } from '@/i18n'

// v-model 控制弹窗显隐
defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// 二维码数据：图片路径与文案 key
const codes = [
  { img: '/images/wx.png', alt: '微信赞赏码', title: '微信赞赏', tip: '用微信扫一扫' },
  { img: '/images/zfb.jpg', alt: '支付宝收款码', title: '支付宝', tip: '用支付宝扫一扫' },
]
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="t('赞助支持')"
    width="520px"
    align-center
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p class="mb-6 text-center text-sm text-gray-500">
      {{ t('如果这个项目对您有帮助，可以请作者喝杯咖啡 ☕️') }}
    </p>
    <div class="flex c-xs:flex-col items-center justify-center gap-6">
      <div v-for="code in codes" :key="code.img" class="flex flex-col items-center">
        <img
          :src="code.img"
          :alt="t(code.alt)"
          class="h-[200px] w-[200px] rounded-lg border border-gray-200 object-contain p-1"
        />
        <p class="mt-3 font-medium">{{ t(code.title) }}</p>
        <p class="mt-2 text-sm text-gray-500">{{ t(code.tip) }}</p>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped>
/* 小屏时限制弹窗宽度，避免 520px 固定宽超出屏幕 */
:deep(.el-dialog) {
  max-width: 92vw;
}
</style>
