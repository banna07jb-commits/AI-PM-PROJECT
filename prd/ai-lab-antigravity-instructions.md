# 🧪 AI Lab 前端开发指令（给 antigravity）

**任务**：完成 AI Lab 页面的所有前端 UI 组件  
**核心状态**：API 已就绪，你只需要写界面  
**项目路径**：`/Users/schuser/ai-pm-project/`  

---

## ⚠️ 最重要的事先说

### 已经写好的文件（不要动！）
- `lib/deepseek.ts` — DeepSeek API 封装
- `app/api/lab/optimize/route.ts` — Prompt 优化 API ✅ build 通过
- `app/api/lab/generate-skill/route.ts` — Skill 生成 API ✅ build 通过
- `components/lab/types.ts` — 类型定义

### 你要做的
**新建 7 个文件 + 修改 2 个文件**（见下方清单）

---

## 📁 需要新建的文件（7个）

### 1. `app/lab/page.tsx` — Lab 主页面

```tsx
"use client";
// 这是一个客户端组件
// 导入并渲染 <LabContainer />
// 页面 title/metadata 可以在这里或 layout 里设置
// 保持与 app/page.tsx 相同的代码风格
```

要点：
- `"use client"` 指令必须有
- 导入 LabContainer 并渲染
- 可以设置页面 metadata（如果 Next.js 支持客户端 metadata 的话，不支持就不管）

---

### 2. `components/lab/LabContainer.tsx` — 整体容器 + Tab 切换

这是最外层组件，职责：
- 管理 `activeTab` state：`"optimize"` | `"generate-skill"`
- 渲染 Tab 切换栏
- 根据 activeTab 渲染 `<PromptOptimizer />` 或 `<SkillGenerator />`
- 外层容器样式（最大宽度、居中、padding）

**Tab 切换栏设计**：
```
┌──────────────────────────────────────────────┐
│  ⚡ Prompt 优化    │    🛠️ Skill 生成        │
└──────────────────────────────────────────────┘
```
- 当前 tab 有底部高亮边框（颜色用主色调）
- 未选中 tab 文字灰色，hover 时变亮
- 切换有过渡动画（border-bottom 或 background 200ms ease）
- 两个 tab 等宽，水平排列

---

### 3. `components/lab/PromptOptimizer.tsx` — Tab 1: Prompt 优化面板

组合使用 `<InputArea />` 和 `<OutputDisplay />`
- 传给 InputArea 的 props：
  - placeholder: `"输入你想优化的 AI 提示词，比如："帮我写一篇关于人工智能的文章"""`
  - examples: 见下方示例列表
  - buttonText: `"✨ 开始优化"`
  - onSubmit: 调用 `POST /api/lab/optimize`，把结果传给 OutputDisplay
  - isLoading: loading state
- 管理 output state，传给 OutputDisplay

**Prompt 优化器的示例 chips（点击填入输入框）**：
1. "帮我写一篇关于人工智能的文章"
2. "用 Python 分析 Excel 销售数据"
3. "给我推荐一些适合周末看的电影"
4. "写一封求职邮件给字节跳动的产品经理岗位"

---

### 4. `components/lab/SkillGenerator.tsx` — Tab 2: Skill 生成面板

结构同 PromptOptimizer，但参数不同：
- placeholder: `"描述你想要的 AI 助手能力，比如："我想要一个能帮我写周报的助手"""`
- buttonText: `"🛠️ 生成 Skill"`
- onSubmit: 调用 `POST /api/lab/generate-skill`
- apiEndpoint: `/api/lab/generate-skill`

**Skill 生成器的示例 chips**：
1. "我想要一个能帮我写周报的助手"
2. "一个精通 SQL 查询优化的数据库顾问"
3. "一个能帮我想英文名字的创意助手"
4. "一个模拟用户进行产品测试的 QA 专家"

---

### 5. `components/lab/InputArea.tsx` — 通用输入区组件

```typescript
interface InputAreaProps {
  placeholder: string;
  examples: string[];
  onSubmit: (text: string) => void;
  isLoading: boolean;
  buttonText: string;
}
```

**UI 设计**：
```
┌─ 输入框 ─────────────────────────────────┐
│                                          │
│ [Textarea: 自动高度, min 120px, max 400px] │
│                                          │
└──────────────────────────────────────────┘

💬 试试示例：[示例1] [示例2] [示例3] [示例4]

              [ 🔘 按钮 ]
```

交互细节：
- Textarea 自适应高度（监听 input 事件调整 height）
- 输入为空时按钮禁用（灰色，不可点击）
- Loading 时按钮显示旋转图标（⏳ 或 spinner），文字变为"处理中..."
- 点击 example chip → 文字填入 textarea（追加还是替换？**替换**）
- chip 样式：小圆角矩形标签，浅色背景，深色文字，hover 时背景变深
- 提交后自动滚动到输出区域

---

### 6. `components/lab/OutputDisplay.tsx` — 通用输出展示组件

```typescript
interface OutputDisplayProps {
  content: string | null; // markdown 字符串，null 表示还没结果
  isLoading: boolean;
}
```

**三种状态**：

① **空态（content === null && !isLoading）**
- 不渲染任何内容，或者显示一行淡淡的提示文字："优化结果将出现在这里..."

② **加载中（isLoading === true）**
- 显示骨架屏效果：3-4 条灰色横条脉冲动画（类似 Facebook skeleton loader）
- 或者简单的居中 spinner + "AI 正在思考..."

③ **有内容（content !== null）**
```
┌─ 结果展示 ──────────────────────────────┐
│ ▎                                     │
│ ## ✨ 优化后的 Prompt                   │
│ ...markdown 渲染后的内容...            │
│                                         │
│ ## 📊 优化说明                          │
│ ...                                    │
│                                         │
│                    [ 📋 复制 ]           │
└─────────────────────────────────────────┘
```
- 左侧有一条彩色竖线装饰（3px 宽，颜色用主色调 Indigo `#6366f1`）
- 使用 `react-markdown` 渲染（项目已有此依赖）
- 代码块要有不同的背景色（稍深的底色）
- 底部右侧放复制按钮
- 复制按钮点击后：
  - 写入 `navigator.clipboard.writeText(content)`
  - 按钮文字短暂变为 "✅ 已复制！"（1.5秒后恢复）
- 结果区域要有内边距（padding: 24px+）

---

### 7. `components/lab/ExampleChips.tsx` — 示例标签组件

```typescript
interface ExampleChipsProps {
  examples: string[];
  onSelect: (text: string) => void;
}
```
- 水平排列的标签列表（flex wrap，超出换行）
- 每个 tag 就是一个可点击的小 pill
- 点击触发 onSelect 回调

---

## 📁 需要修改的文件（2个）

### 8. `app/globals.css` — 追加 Lab 样式

**在文件末尾追加以下内容**（不要修改已有样式！）：

```css
/* ========================================
   AI Lab Styles (暗色科技风)
   ======================================== */

/* CSS 变量 */
.lab-container {
  --lab-bg: #0a0a0f;
  --lab-card-bg: #12121a;
  --lab-border: #1e1e2e;
  --lab-border-hover: #2a2a3e;
  --lab-accent: #6366f1;
  --lab-accent-hover: #818cf8;
  --lab-accent-subtle: rgba(99, 102, 241, 0.15);
  --lab-text: #e2e8f0;
  --lab-text-muted: #64748b;
  --lab-text-dim: #3d4455;
  --lab-success: #22c55e;
  --lab-error: #ef4444;
  --lab-radius: 12px;
  --lab-radius-sm: 8px;

  /* 整体容器 */
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 24px;
  min-height: calc(100vh - 80px);
  color: var(--lab-text);
  font-family: var(--font-geist-sans), system-ui, sans-serif;
}

/* ===== Tab 切换栏 ===== */
.lab-tab-bar {
  display: flex;
  border-bottom: 1px solid var(--lab-border);
  margin-bottom: 32px;
}

.lab-tab {
  flex: 1;
  padding: 14px 20px;
  font-size: 15px;
  font-weight: 500;
  color: var(--lab-text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 200ms ease;
  background: none;
  text-align: center;
}

.lab-tab:hover {
  color: var(--lab-text);
  background: rgba(255,255,255,0.02);
}

.lab-tab.active {
  color: var(--lab-accent);
  border-bottom-color: var(--lab-accent);
}

/* ===== 输入区 ===== */
.lab-input-area {
  background: var(--lab-card-bg);
  border: 1px solid var(--lab-border);
  border-radius: var(--lab-radius);
  padding: 20px;
  margin-bottom: 16px;
}

.lab-textarea {
  width: 100%;
  min-height: 120px;
  max-height: 400px;
  padding: 14px 16px;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--lab-border);
  border-radius: var(--lab-radius-sm);
  color: var(--lab-text);
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  transition: border-color 200ms ease;
  font-family: inherit;
  box-sizing: border-box;
}

.lab-textarea:focus {
  border-color: var(--lab-accent);
  box-shadow: 0 0 0 3px var(--lab-accent-subtle);
}

.lab-textarea::placeholder {
  color: var(--lab-text-dim);
}

/* 示例 chips */
.lab-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 12px 0;
  font-size: 13px;
  color: var(--lab-text-muted);
}

.lab-chip {
  padding: 5px 12px;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 20px;
  font-size: 12px;
  color: var(--lab-accent);
  cursor: pointer;
  transition: all 150ms ease;
}

.lab-chip:hover {
  background: rgba(99, 102, 241, 0.2);
  border-color: var(--lab-accent);
}

/* 提交按钮 */
.lab-submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 24px;
  background: var(--lab-accent);
  color: white;
  border: none;
  border-radius: var(--lab-radius-sm);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease;
  margin-top: 12px;
}

.lab-submit-btn:hover:not(:disabled) {
  background: var(--lab-accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.lab-submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 加载动画 */
@keyframes lab-spin {
  to { transform: rotate(360deg); }
}

.lab-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: lab-spin 0.6s linear infinite;
}

/* ===== 输出区 ===== */
.lab-output-area {
  background: var(--lab-card-bg);
  border: 1px solid var(--lab-border);
  border-radius: var(--lab-radius);
  overflow: hidden;
  margin-top: 24px;
}

.lab-output-inner {
  border-left: 3px solid var(--lab-accent);
  padding: 24px 28px;
}

/* 空态提示 */
.lab-empty-hint {
  color: var(--lab-text-dim);
  font-size: 14px;
  text-align: center;
  padding: 40px 20px;
}

/* 骨架屏 / 加载态 */
.lab-loading {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lab-skeleton-line {
  height: 14px;
  background: linear-gradient(90deg, var(--lab-border) 25%, var(--lab-border-hover) 50%, var(--lab-border) 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: lab-shimmer 1.5s infinite;
}

.lab-skeleton-line:nth-child(1) { width: 80%; }
.lab-skeleton-line:nth-child(2) { width: 100%; }
.lab-skeleton-line:nth-child(3) { width: 60%; }
.lab-skeleton-line:nth-child(4) { width: 85%; }

@keyframes lab-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Markdown 内容样式 */
.lab-markdown h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--lab-text);
  margin: 20px 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--lab-border);
}

.lab-markdown h2:first-child {
  margin-top: 0;
}

.lab-markdown p {
  color: var(--lab-text);
  line-height: 1.7;
  margin: 8px 0;
}

.lab-markdown ul, .lab-markdown ol {
  padding-left: 20px;
  margin: 10px 0;
  color: var(--lab-text);
}

.lab-markdown li {
  margin: 4px 0;
  line-height: 1.6;
}

.lab-markdown code {
  background: rgba(99, 102, 241, 0.15);
  color: var(--lab-accent-hover);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
  font-family: var(--font-geist-mono), monospace;
}

.lab-markdown pre {
  background: #080810;
  border: 1px solid var(--lab-border);
  border-radius: var(--lab-radius-sm);
  padding: 16px;
  overflow-x: auto;
  margin: 12px 0;
}

.lab-markdown pre code {
  background: none;
  padding: 0;
  color: var(--lab-text);
  font-size: 13px;
}

.lab-markdown strong {
  color: #f1f5f9;
  font-weight: 600;
}

.lab-markdown blockquote {
  border-left: 3px solid var(--lab-accent);
  margin: 12px 0;
  padding: 8px 16px;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 0 var(--lab-radius-sm) var(--lab-radius-sm) 0;
  color: var(--lab-text-muted);
}

/* 复制按钮 */
.lab-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: transparent;
  border: 1px solid var(--lab-border);
  border-radius: var(--lab-radius-sm);
  color: var(--lab-text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 150ms ease;
  margin-top: 16px;
}

.lab-copy-btn:hover {
  border-color: var(--lab-accent);
  color: var(--lab-accent);
  background: var(--lab-accent-subtle);
}

.lab-copy-btn.copied {
  border-color: var(--lab-success);
  color: var(--lab-success);
  background: rgba(34, 197, 94, 0.1);
}

/* ===== 响应式 ===== */
@media (max-width: 640px) {
  .lab-container {
    padding: 24px 16px;
  }

  .lab-tab {
    font-size: 14px;
    padding: 12px 14px;
  }

  .lab-input-area {
    padding: 14px;
  }

  .lab-output-inner {
    padding: 18px 16px;
  }

  .lab-examples {
    flex-direction: column;
    align-items: stretch;
  }

  .lab-chip {
    text-align: center;
  }
}
```

> **重要**：以上是完整 CSS，直接全部追加到 globals.css 末尾。不要遗漏任何部分。

---

### 9. `app/page.tsx` — 加入口链接

在主页找一个合适的位置加一个指向 `/lab` 的链接。

建议位置：Hero 区域的按钮组附近，或者导航/section 列表中。

形式可以是一个链接按钮：
```html
<a href="/lab" class="...">🧪 AI Lab</a>
```

具体放在哪里、用什么样式，由你根据现有页面布局选择最自然的位置。保持与周围元素风格一致即可。

---

## 🔗 API 对接说明

antigravity 不需要关心 API 实现，只需要知道怎么调用：

| 功能 | Method | URL | Request Body | Response |
|------|--------|-----|-------------|----------|
| Prompt 优化 | POST | `/api/lab/optimize` | `{ prompt: "string" }` | `{ result: "markdown" }` |
| Skill 生成 | POST | `/api/lab/generate-skill` | `{ description: "string" }` | `{ result: "markdown" }` |

**错误响应格式**：`{ error: "错误信息" }`（HTTP 状态码非 200）

前端调用示例：
```typescript
const res = await fetch("/api/lab/optimize", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt: userInput }),
});
const data = await res.json();
if (!res.ok) { /* 显示 data.error */ }
else { /* 显示 data.result */ }
```

---

## ✅ 完成检查清单

做完后逐项确认：

### 功能
- [ ] `/lab` 页面可访问
- [ ] Tab 切换正常（两个 tab 互不干扰状态）
- [ ] Tab 1：输入 → 点"开始优化" → 显示结果（markdown 渲染正确）
- [ ] Tab 2：输入 → 点"生成 Skill" → 显示结果
- [ ] 示例 chips 点击可填入输入框
- [ ] 复制按钮可用（点一下复制到剪贴板）
- [ ] 加载态有骨架屏动画
- [ ] 空态有提示文字
- [ ] 输入为空时按钮禁用
- [ ] 主页有链接能跳转到 `/lab`

### 样式
- [ ] 暗色主题生效（不是白色背景！）
- [ ] Tab 高亮、focus 状态、hover 状态都有视觉反馈
- [ ] 输出区左侧有彩色竖线
- [ ] Markdown 渲染正确（标题/列表/代码块/引用都好看）
- [ ] 手机上布局正常（不溢出、不重叠）

### 构建
- [ ] `npm run build` 无报错
- [ ] 新页面出现在路由列表中

---

*来自 peter 🦞 的完整指令 | API 层已就绪，只管写界面就好*
