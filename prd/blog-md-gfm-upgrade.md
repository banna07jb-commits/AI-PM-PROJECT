# 博客 Markdown 渲染升级：支持 GFM 语法

## 问题描述
博客编辑器目前只支持基础 Markdown 语法，以下格式无法正常渲染：
- **加粗** `**text**`
- **表格** `| col | col |`
- **删除线** `~~text~~`
- **任务列表** `- [ ]`
- 可能标题也有问题

## 解决方案

### 第一步：安装依赖

```bash
npm install remark-gfm
```

> 如果用的是 Next.js + react-markdown，这个就够了。
> 如果用的是其他库（marked / markdown-it），告诉我，我给对应的方案。

### 第二步：修改博客文章渲染组件

找到显示博客文章内容的组件（大概在 `components/blog/` 或 `app/blog/` 下），把原来的：

```tsx
import ReactMarkdown from 'react-markdown'

<ReactMarkdown>{post.content}</ReactMarkdown>
```

改成：

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

<ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
```

### 第三步（可选但推荐）：代码高亮

如果博客会贴代码，顺便加上语法高亮：

```bash
npm install rehype-highlight
```

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

// 在页面或 layout 里引入 CSS
import 'highlight.js/styles/github-dark.css'

<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeHighlight]}
>{post.content}</ReactMarkdown>
```

## 改动范围

| 文件 | 改动量 |
|------|--------|
| `package.json` | +1 依赖 |
| 渲染组件（1个文件）| +3 行 import + 1 个 prop |

**总共改动不到 10 行代码。**

## 验证方式

改完后在编辑器里新建文章，粘贴以下测试内容：

```markdown
## ✅ 功能测试

**这是加粗文本**

| 列A | 列B | 列C |
|-----|-----|-----|
| 1   | 2   | 3   |

- [x] 支持表格
- [x] 支持加粗
- [ ] 待完成

~~删除线文字~~

`行内代码`

> 引用块

\`\`\`javascript
const test = "hello";
console.log(test);
\`\`\`
```

全部正常渲染 = 搞定 ✅

---

> 来自 peter 🦞 — 如有疑问随时沟通
