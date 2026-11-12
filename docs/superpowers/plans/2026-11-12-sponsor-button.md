# 赞助按钮与赞赏码弹窗 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Header 右上角新增「❤️ 赞助」按钮，点击弹出模态框并排展示微信赞赏码与支付宝收款码，文案跟随 i18n 中英切换。

**Architecture:** 新建独立组件 `SponsorDialog.vue` 封装 el-dialog 弹窗（SRP），Header.vue 仅持有一个显隐 `ref` 并放置触发按钮（方案 A）。i18n 复用现有 `t()` 机制——中文即 key，`en.json` 提供英文翻译。图片走 public 目录绝对路径。设计文档：`docs/superpowers/specs/2026-11-12-sponsor-button-design.md`

**Tech Stack:** Vue 3.3 `<script setup lang="ts">` + Element Plus 2.4（main.ts 全量引入，组件直接用）+ Tailwind CSS（自定义断点）

## Global Constraints

- i18n 机制：界面文案一律经 `t('中文')` 输出；中文即 key，英文翻译写入 `src/i18n/en.json`；`t()` 签名为 `t(value: unknown, params?): string`（见 `src/i18n/index.ts`）
- 响应式断点：`c-xs` = max-width 768px（desktop-first，见 `tailwind.config.js`）；小屏样式用 `c-xs:` 前缀
- 图片引用：`/images/wx.png`、`/images/zfb.jpg`（public 目录，无需 import，勿移动文件）
- 构建命令：`npm run build` = `vue-tsc --noEmit && vite build`，包含完整类型检查
- 项目无测试框架，验证方式 = 类型检查 + 构建 + `npm run dev` 手动验证
- 文件路径一律使用完整绝对 Windows 路径（如 `D:\workSpace\tools-web\src\...`）
- git commit message 末尾附 `Co-Authored-By: Claude <noreply@anthropic.com>`

## 与设计文档的偏差说明

设计文档 §6 列了 7 条词条，但 §5.2 要求图片 `alt` 用「微信赞赏码」「支付宝收款码」——这两条 alt 文案同样需要英文翻译（外国用户的屏幕阅读器为英文），故本计划新增词条共 **9 条**（多出 2 条 alt 翻译），并在 Task 1 一并写入。

---

### Task 1: 新增 i18n 英文翻译词条

**Files:**
- Modify: `D:\workSpace\tools-web\src\i18n\en.json`（第 102 行 `"保存到桌面": "Save to Desktop",` 之后插入）

**Interfaces:**
- Consumes: 无
- Produces: 9 条翻译词条，供 Task 2（弹窗内 8 个文案 key）与 Task 3（按钮文案 key `赞助`）通过 `t()` 消费。key 必须与任务中代码引用的中文串逐字一致（含标点、emoji）

- [ ] **Step 1: 在 en.json 插入 9 条词条**

用编辑器打开 `D:\workSpace\tools-web\src\i18n\en.json`，定位到（约第 102 行）：

```json
  "保存到桌面": "Save to Desktop",
```

在该行之后插入以下 9 行（注意：JSON 中 key 的中文、逗号、emoji ☕️ 必须逐字保留，`t()` 按整串匹配）：

```json
  "赞助": "Donate",
  "赞助支持": "Support Us",
  "如果这个项目对您有帮助，可以请作者喝杯咖啡 ☕️": "If you find this project helpful, buy the author a coffee ☕️",
  "微信赞赏": "WeChat",
  "微信赞赏码": "WeChat donation QR code",
  "用微信扫一扫": "Scan with WeChat",
  "支付宝": "Alipay",
  "支付宝收款码": "Alipay payment QR code",
  "用支付宝扫一扫": "Scan with Alipay",
```

> 说明：en.json 大体按 Unicode 码点排序，但 `t()` 是哈希查表、key 顺序不影响功能；集中插在「保存到桌面」之后便于审查回溯（KISS）。

- [ ] **Step 2: 验证 JSON 语法有效**

```bash
cd "D:\workSpace\tools-web" && node -e "JSON.parse(require('fs').readFileSync('src/i18n/en.json','utf8'));console.log('JSON valid')"
```

Expected: 输出 `JSON valid`，退出码 0。若报错说明逗号/引号有误，修复后重跑。

- [ ] **Step 3: Commit**

```bash
cd "D:\workSpace\tools-web" && git add src/i18n/en.json && git commit -m "feat(i18n): 新增赞助功能英文翻译词条

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: 创建 SponsorDialog 弹窗组件

**Files:**
- Create: `D:\workSpace\tools-web\src\components\Layout\Header\SponsorDialog.vue`

**Interfaces:**
- Consumes: `t()`（`@/i18n`，Task 1 的 8 个文案 key）；静态图片 `/images/wx.png`、`/images/zfb.jpg`
- Produces: 默认导出组件 `SponsorDialog`，接口为 `modelValue: boolean` prop + `update:modelValue` emit，支持父组件 `v-model` 双向绑定。Task 3 依赖此接口，勿改名

- [ ] **Step 1: 创建组件文件**

新建 `D:\workSpace\tools-web\src\components\Layout\Header\SponsorDialog.vue`，内容如下（完整复制，两码卡片用数据数组 + v-for 消除重复，DRY）：

```vue
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
```

要点说明（实现者须知）：
- `c-xs:flex-col`：≤768px 时两码由横排变竖排堆叠（Global Constraints 的自定义断点）
- `align-center` 让弹窗垂直居中，Element Plus 2.4.3 支持
- ESC / 点击遮罩 / 右上角 × 的关闭由 el-dialog 内置触发 `update:modelValue`，组件无需额外处理

- [ ] **Step 2: 类型检查**

```bash
cd "D:\workSpace\tools-web" && npx vue-tsc --noEmit
```

Expected: 无输出、退出码 0。若报错仅当与本组件相关才修复；若是仓库既有无关错误，如实记录并询问负责人，勿顺手改动无关文件。

- [ ] **Step 3: Commit**

```bash
cd "D:\workSpace\tools-web" && git add src/components/Layout/Header/SponsorDialog.vue && git commit -m "feat(header): 新增赞助二维码弹窗组件 SponsorDialog

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: Header.vue 集成赞助按钮

**Files:**
- Modify: `D:\workSpace\tools-web\src\components\Layout\Header\Header.vue`
  - script：import 区（第 11 行 `import router from '@/router';` 附近）与状态区（第 13 行 `const loading = ref(false)` 附近）
  - template：GitHub `<li>` 结束（第 174 行 `</li>`）与「保存到桌面」`<li>`（第 176 行）之间插入新 `<li>`；`</ul>`（第 179 行）之后挂载弹窗组件

**Interfaces:**
- Consumes: Task 2 的 `SponsorDialog` 组件（`v-model` 接口）、Task 1 的 `t('赞助')` 词条、`ref`（已在文件中从 vue 引入）
- Produces: 无（最终集成层）

- [ ] **Step 1: script 区新增导入与状态**

在 `D:\workSpace\tools-web\src\components\Layout\Header\Header.vue` 中：

第 11 行 `import router from '@/router';` 之后新增一行：

```ts
import SponsorDialog from '@/components/Layout/Header/SponsorDialog.vue'
```

第 13 行 `const loading = ref(false)` 之后新增两行：

```ts
//赞助弹窗显隐
const sponsorVisible = ref(false)
```

- [ ] **Step 2: template 区插入按钮与弹窗**

GitHub 图标的 `<li>`（第 163-174 行）结束之后、「保存到桌面」的 `<li class="hover:text-blue-500 c-xs:hidden">`（第 176 行）之前，插入：

```html
        <!-- sponsor -->
        <li class="ml-3">
          <el-button
            type="primary"
            class="bg-gradient-to-r from-pink-500 to-red-500"
            :aria-label="t('赞助')"
            @click="sponsorVisible = true"
          >❤️ <span class="c-xs:hidden">{{ t('赞助') }}</span></el-button>
        </li>
```

要点：`<li class="ml-3">` 与 GitHub 图标项对齐；`ml-3` 已写在 li 上故 el-button 不再重复加；内层 `c-xs:hidden` 仅隐藏文字、小屏保留 ❤️ 按钮（与「保存到桌面」整个隐藏不同，见设计文档 §7）；红色渐变区分于「保存到桌面」的蓝色渐变。

右上角容器 `</ul>`（第 179 行）之后、`</div>` 之前插入：

```html
      <!-- 赞助弹窗 -->
      <SponsorDialog v-model="sponsorVisible" />
```

- [ ] **Step 3: 类型检查**

```bash
cd "D:\workSpace\tools-web" && npx vue-tsc --noEmit
```

Expected: 无输出、退出码 0。

- [ ] **Step 4: Commit**

```bash
cd "D:\workSpace\tools-web" && git add src/components/Layout/Header/Header.vue && git commit -m "feat(header): 右上角集成赞助按钮与弹窗入口

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: 端到端验证

**Files:**
- 无新改动（本任务只验证；若验证发现缺陷，修复属于对应源文件并单独 commit）

**Interfaces:**
- Consumes: Task 1-3 的全部产出
- Produces: 验证结论（通过/缺陷清单）

- [ ] **Step 1: 完整构建（类型检查 + 打包）**

```bash
cd "D:\workSpace\tools-web" && npm run build
```

Expected: `vue-tsc --noEmit` 与 vite build 均无错误退出码 0。若报错与本功能相关，回对应 Task 修复；无关既有错误如实上报。

- [ ] **Step 2: 启动开发服务器手动验证**

```bash
cd "D:\workSpace\tools-web" && npm run dev
```

浏览器打开本地地址（默认 `http://localhost:5173`），逐项核对（来自设计文档 §9）：

| # | 检查项 | 预期 |
|---|---|---|
| 1 | Header 右上角 GitHub 图标与「保存到桌面」之间 | 出现红色渐变「❤️ 赞助」按钮 |
| 2 | 点击按钮 | 弹出居中模态框，标题「赞助支持」，两码并排展示 |
| 3 | 弹窗文案 | 微信卡片：图 +「微信赞赏」+「用微信扫一扫」；支付宝卡片：图 +「支付宝」+「用支付宝扫一扫」 |
| 4 | 点击右上角语言按钮切换 English | 按钮变「❤️ Donate」，弹窗标题「Support Us」，卡片文案变 WeChat/Alipay/Scan with... |
| 5 | ESC 键 / 点击遮罩 / 右上角 × | 三种方式均可关闭弹窗 |
| 6 | 浏览器窗口缩窄至 ≤768px | 按钮仅剩 ❤️；弹窗内两码竖排堆叠且不缩小、弹窗不超出屏幕 |

- [ ] **Step 3: 处理验证结果**

全部通过 → 向负责人汇报完成，本任务结束（无代码改动则无 commit）。
发现缺陷 → 用 superpowers:systematic-debugging 定位，修复后回到 Step 1 重验，修复单独 commit（`fix(header): ...`）。

---

## 计划自审记录

1. **Spec 覆盖**：§3 文件清单 → Task 1/2/3；§5.1 按钮 → Task 3 Step 2；§5.2 弹窗 → Task 2 Step 1；§6 词条 → Task 1（+2 条 alt，见偏差说明）；§7 响应式 → Task 2 `c-xs:flex-col` + Task 3 `c-xs:hidden` + Task 4 检查项 6；§8 边界 → el-dialog 内置（Task 2 要点）；§9 验证 → Task 4。无遗漏
2. **占位符扫描**：无 TBD/TODO/"适当处理"；所有代码步骤含完整代码
3. **类型一致性**：`modelValue: boolean` / `update:modelValue` 在 Task 2 定义、Task 3 以 `v-model` 消费一致；Task 1 词条 key 与 Task 2/3 代码中的中文串逐字一致（含 ☕️ emoji 与全角标点）；图片路径与 public 文件名一致
