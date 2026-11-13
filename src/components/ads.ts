/**
 * Adsterra 广告位集中配置。
 * 每个尺寸的广告位需在 Adsterra 后台单独创建（各自有独立的 key 与脚本地址），
 * 把对应代码中的 key 与 script src 填入即可生效；key 留空时该广告位不渲染。
 */
export interface AdSlot {
  /** Adsterra 后台的广告位 key */
  adKey: string
  /** invoke 脚本地址（Adsterra 代码中 script 标签的 src） */
  scriptSrc: string
  /** 广告宽度（px），用于占位防抖动 */
  width: number
  /** 广告高度（px） */
  height: number
}

export const adSlots: Record<string, AdSlot> = {
  /** 首页底部横幅（电脑端 728x90） */
  desktopBanner: {
    adKey: 'f7865f7ecbfae1e0b1f49b1ebdeb011f',
    scriptSrc: 'https://bauval.org/22/f7865f7ecbfae1e0b1f49b1ebdeb011f',
    width: 728,
    height: 90,
  },
  /** 首页底部横幅（手机端 320x50） */
  mobileBanner: {
    adKey: 'bc59a7dc1b97eb9eadc4fb8af5c3ec84',
    scriptSrc: 'https://bauval.org/22/bc59a7dc1b97eb9eadc4fb8af5c3ec84',
    width: 320,
    height: 50,
  },
  /** 工具详情页内容下方的矩形广告（300x250） */
  rectangle: {
    adKey: '38df937fe900152d7744497705ed4c96',
    scriptSrc: 'https://bauval.org/22/38df937fe900152d7744497705ed4c96',
    width: 300,
    height: 250,
  },
}
