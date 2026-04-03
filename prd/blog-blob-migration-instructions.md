# 📦 博客存储迁移指令（给 antigravity）

**任务**：把 3 个 blog API route 从本地 `fs` 改为 Vercel Blob 存储
**核心已就绪**：`lib/blob.ts` 已写好（getPosts / savePosts 函数）
**你的工作**：改造 3 个 API 文件

---

## ⚠️ 核心原则

- **API 接口不变**（请求/响应格式完全一致，前端无感知）
- **数据结构不变**（posts 数组格式不变）
- **只换存储后端**：`fs.readFile/fs.writeFile` → `getPosts/savePosts`

---

## 已写好的文件（不要动！）

### `lib/blob.ts` — Blob 客户端封装

提供两个核心函数：
```typescript
import { getPosts, savePosts } from "@/lib/blob";

const posts = await getPosts();   // 获取所有文章（自动处理初始化）
await savePosts(posts);          // 保存文章到 Blob
```

- `getPosts()` — 优先读 Blob，Blob 为空则从本地 `data/posts.json` 初始化
- `savePosts(posts)` — 把完整 posts 数组写入 Vercel Blob

---

## 需要改造的文件（3 个）

### 1. `app/api/blog/route.ts`

这是博客的主 API，有 3 个方法：GET / POST / PUT

#### 改造模式（每个方法都按这个模式改）：

```typescript
// ===== 删除这些 import =====
// import fs from 'fs/promises';
// import path from 'path';
// const dataFilePath = path.join(process.cwd(), 'data/posts.json');

// ===== 新增这个 import =====
import { getPosts, savePosts } from "@/lib/blob";
```

#### GET 方法改造：

```typescript
// 旧代码：
const fileContents = await fs.readFile(dataFilePath, 'utf8');
let posts = JSON.parse(fileContents);
if (!fetchAll) {
  posts = posts.filter((p: any) => p.isPrivate !== true);
}

// 新代码：
let posts = await getPosts();
if (!fetchAll) {
  posts = posts.filter((p: any) => p.isPrivate !== true);
}
```

#### POST 方法改造：

```typescript
// 旧代码：
const fileContents = await fs.readFile(dataFilePath, 'utf8');
let posts = JSON.parse(fileContents);
// ... 各种校验和修改 posts ...
await fs.writeFile(dataFilePath, JSON.stringify(posts, null, 2), 'utf8');
return NextResponse.json(newPost, { status: 201 });

// 新代码：
let posts = await getPosts();
// ... 各种校验和修改 posts（保持不变）...
await savePosts(posts);
return NextResponse.json(newPost, { status: 201 });
```

#### PUT 方法改造：

```typescript
// 旧代码：
const fileContents = await fs.readFile(dataFilePath, 'utf8');
let posts = JSON.parse(fileContents);
// ... 查找并更新 post ...
await fs.writeFile(dataFilePath, JSON.stringify(posts, null, 2), 'utf8');

// 新代码：
let posts = await getPosts();
// ... 查找并更新 post（保持不变）...
await savePosts(posts);
```

---

### 2. `app/api/blog/[slug]/interact/route.ts`

这个处理点赞和评论。

```typescript
// ===== 删除 =====
// import fs from 'fs/promises';
// import path from 'path';
// const dataFilePath = path.join(process.cwd(), 'data/posts.json');

// ===== 新增 =====
import { getPosts, savePosts } from "@/lib/blob";
```

然后把所有的：
```typescript
const fileContents = await fs.readFile(dataFilePath, 'utf8');
let posts = JSON.parse(fileContents);
// ...
await fs.writeFile(dataFilePath, JSON.stringify(posts, null, 2), 'utf8');
```

替换为：
```typescript
let posts = await getPosts();
// ...
await savePosts(posts);
```

中间的业务逻辑（查找文章、更新 likes/comments 等）**一行都不用改**。

---

### 3. `app/api/blog/[slug]/route.ts`

同样的改造模式：
- 删 `fs` 和 `path` import
- 加 `import { getPosts } from "@/lib/blob"`
- `fs.readFile` → `getPosts()`
- 如果有写入操作 → `savePosts(posts)`

---

## 改造清单（checklist）

对每个文件执行以下操作：

1. [ ] 删除 `import fs from 'fs/promises'`
2. [ ] 删除 `import path from 'path'`
3. [ ] 删除 `const dataFilePath = ...` 行
4. [ ] 添加 `import { getPosts, savePosts } from "@/lib/blob"`
5. [ ] 所有 `fs.readFile(dataFilePath, 'utf8')` + `JSON.parse(...)` → 替换为 `await getPosts()`
6. [ ] 所有 `fs.writeFile(dataFilePath, JSON.stringify(...))` → 替换为 `await savePosts(...)`
7. [ ] 确保中间业务逻辑原封不动

---

## 验证

改完后：
```bash
npm run build
```

确保 build 无报错，然后 git push。

---

*来自 peter 🦞 | lib/blob.ts 已就绪，只管替换存储调用即可*
