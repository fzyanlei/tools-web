import { onUnmounted, ref } from 'vue'

/**
 * 浮动广告容器的展示控制：广告加载完成前隐藏广告框，
 * 加载完成后显示并启动关闭按钮倒计时，倒计时结束才可点击关闭。
 */
export function useAdReveal(countdownSeconds: number) {
  /** 广告 iframe 是否已加载完成 */
  const adLoaded = ref(false)
  /** 容器是否可见（关闭后置 false） */
  const visible = ref(true)
  /** 关闭按钮出现前的剩余秒数 */
  const countdown = ref(countdownSeconds)

  let timer: ReturnType<typeof setInterval> | undefined

  /** 由 AdsterraIframeAd 的 loaded 事件触发，只生效一次 */
  const onLoaded = () => {
    if (adLoaded.value) return
    adLoaded.value = true
    timer = setInterval(() => {
      countdown.value -= 1
      if (countdown.value <= 0 && timer) clearInterval(timer)
    }, 1000)
  }

  const close = () => {
    visible.value = false
  }

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return { adLoaded, visible, countdown, onLoaded, close }
}
