# 设计文档：Header 赞助按钮 + 赞赏码模态框

- 日期：2026-11-12
- 状态：已获用户批准
- 范围：Header 右上角新增「❤️ 赞助」按钮，点击弹出模态框并排展示微信赞赏码与支付宝收款码

## 1. 背景与目标

tools-web 是一款免费开源的在线工具箱。为给项目提供持续维护的动力，在 Header 右上角增加赞助入口：

- 点击「❤️ 赞助」按钮弹出模态框
- 模态框内并排展示微信赞赏码（`public/images/wx.png`）与支付宝收款码（`public/images/zfb.jpg`）
- 说明文案跟随站点语言切换（中文 / English），方便外国友人扫码

## 2. 技术决策

- **实现方式**：独立组件 `SponsorDialog.vue` + Element Plus `el-dialog`（已选方案 A）
  - 理由：符合项目按功能分文件的组件化模式（SRP）；Element Plus 在 `main.ts` 全量引入，`el-dialog` 直接可用，自带 ESC/遮罩关闭、焦点管理、可访问性属性（DRY/KISS）
- **国际化**：复用现有 `t()` 机制——中文即 key，`en.json` 提供英文翻译
- **图片引用**：public 目录绝对路径 `/images/wx.png`、`/images/zfb.jpg`，无需 import

## 3. 文件变更清单

| 文件 | 变更 | 内容 |
|---|---|---|
| `src/components/Layout/Header/SponsorDialog.vue` | 新增 | 赞助模态框组件 |
| `src/components/Layout/Header/Header.vue` | 修改 | GitHub 图标与「保存到桌面」按钮之间插入一个 `<li>`，含 ❤️ 赞助按钮 + 引入 SponsorDialog |
| `src/i18n/en.json` | 修改 | 新增 7 条英文翻译 |

## 4. SponsorDialog 组件设计

**接口**

```ts
// Props
modelValue: boolean   // v-model 控制显隐
// Emits
update:modelValue     // 父组件 v-model 双向绑定
```

**职责**：展示赞助二维码弹窗。父组件（Header.vue）持有一个 `ref(false)` 状态，点击按钮置 `true`；ESC/遮罩/× 关闭时组件 emit `update:modelValue(false)`。

## 5. UI 设计

### 5.1 按钮（Header 右上角，GitHub 图标之后、「保存到桌面」之前）

- `el-button`，内容为 ❤️ emoji + `<span class="c-xs:hidden">赞助</span>`（经 `t('赞助')` 翻译）
- 样式：红色渐变 `bg-gradient-to-r from-pink-500 to-red-500`，与现有「保存到桌面」按钮（蓝色渐变）同款结构与 hover 动效（Header.vue 已有 `.el-button:hover` 全局上浮阴影样式），红色系体现赞助/爱心主题
- 小屏（`c-xs`）：文字隐藏，仅保留 ❤️
- 按钮带 `aria-label`，提供无文字状态下的可访问名称

### 5.2 模态框（el-dialog）

- 标题：`t('赞助支持')`
- 副标题（感谢语）：`t('如果这个项目对您有帮助，可以请作者喝杯咖啡 ☕️')`
- 主体：`flex` 布局两张码卡片，每张卡片含图片（约 200×200，圆角边框）+ 名称 + 扫码说明
- 布局结构示意：

```
┌─────────────────────────────────────┐
│           ❤️ 赞助支持          [×]  │
│      如果这个项目对您有帮助…          │
│   ┌─────────┐      ┌─────────┐     │
│   │ wx.png  │      │ zfb.jpg │     │
│   └─────────┘      └─────────┘     │
│   微信赞赏         支付宝            │
│   用微信扫一扫      用支付宝扫一扫     │
└─────────────────────────────────────┘
```

- 宽度约 520px
- 图片 `alt`：「微信赞赏码」「支付宝收款码」，加载失败时显示 alt 文本

## 6. i18n 词条（en.json 新增）

| 中文（key） | 英文 |
|---|---|
| 赞助 | Donate |
| 赞助支持 | Support Us |
| 如果这个项目对您有帮助，可以请作者喝杯咖啡 ☕️ | If you find this project helpful, buy the author a coffee ☕️ |
| 微信赞赏 | WeChat |
| 用微信扫一扫 | Scan with WeChat |
| 支付宝 | Alipay |
| 用支付宝扫一扫 | Scan with Alipay |

## 7. 响应式行为

复用项目现有断点 `c-xs`（max-width: 768px，见 `tailwind.config.js`）：

- 桌面（>768px）：模态框内两码横排并排；按钮显示 ❤️ + 赞助
- 小屏（≤768px）：模态框内两码竖排堆叠（`flex-col`），二维码保持原尺寸不缩小；按钮仅显示 ❤️

## 8. 边界情况

- 关闭方式：el-dialog 内置 × / ESC / 点击遮罩三种
- 可访问性：按钮 `aria-label`、图片 `alt`、el-dialog 自带 `aria-modal` 与焦点管理
- 图片资源缺失：浏览器显示 alt 文本，不影响弹窗其他部分

## 9. 验证方式

项目无自动化测试框架，采用手动验证：

1. `npm run dev` 启动开发服务器
2. 检查项：
   - Header 右上角出现 ❤️ 赞助按钮（红色渐变）
   - 点击弹出模态框，两张码并排展示
   - 右上角语言切换按钮切换中/英，按钮与弹窗文案随之切换
   - ESC / 遮罩 / × 均可关闭弹窗
   - 浏览器窗口缩窄至 ≤768px：按钮仅剩 ❤️，弹窗内两码竖排
3. `npm run build` 确保类型检查与构建通过
