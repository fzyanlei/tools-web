/**
 * Adsterra 广告位集中配置（iframe 隔离模式）。
 * 每个广告位的投放代码位于 public 下对应的静态 html（原样嵌入 Adsterra 代码），
 * 主页面通过 sandbox iframe 加载，广告脚本不直接注入主页面；
 * src 留空时该广告位不渲染。
 */
export interface AdSlot {
  /** 隔离页面地址（public 下的静态 html） */
  src: string
  /** 广告宽度（px），用于占位防抖动 */
  width: number
  /** 广告高度（px） */
  height: number
}

export const adSlots: Record<string, AdSlot> = {
  /** 首页底部横幅（电脑端 728x90） */
  desktopBanner: {
    src: '/adsterra-728x90.html',
    width: 728,
    height: 90,
  },
  /** 首页底部横幅（手机端 320x50） */
  mobileBanner: {
    src: '/adsterra-320x50.html',
    width: 320,
    height: 50,
  },
  /** 工具详情页矩形广告（300x250）：桌面右侧悬浮 / 手机工具区下方内嵌 */
  rectangle: {
    src: '/adsterra-300x250.html',
    width: 300,
    height: 250,
  },
}
