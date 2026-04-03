/**
 * Vercel Blob Client
 * 博客数据存储（替代本地 fs 读写 posts.json）
 *
 * 环境变量（Vercel 创建 Blob 后自动注入）：
 * - BLOB_READ_WRITE_TOKEN: 读写 Token
 *
 * 用法：把 posts.json 整体存为一个 blob object
 */

import { put, head, del } from "@vercel/blob";
import { readFile } from "fs/promises";

const BLOB_KEY = "data/posts.json";

export function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

/**
 * 获取博客数据（所有文章）
 * 优先从 Blob 读，Blob 为空则从本地文件初始化
 */
export async function getPosts(): Promise<any[]> {
  // 尝试从 Blob 获取
  try {
    const headResult = await head(BLOB_KEY);
    if (headResult) {
      // Blob 存在，通过 URL 获取内容
      const res = await fetch(headResult.url);
      if (res.ok) {
        const text = await res.text();
        console.log("[Blob] Loaded posts from blob");
        return JSON.parse(text);
      }
    }
  } catch (e) {
    // Blob 不存在或读取失败，走初始化逻辑
    console.log("[Blob] Not found, will initialize from local file");
  }

  // 初始化：从本地 data/posts.json 导入
  try {
    const localData = await readFile(
      require("path").join(process.cwd(), "data/posts.json"),
      "utf8"
    );
    const posts = JSON.parse(localData);
    console.log(`[Blob] Initialized with ${posts.length} local posts`);
    return posts;
  } catch (e) {
    console.error("[Blob] No local data found either");
    return [];
  }
}

/**
 * 保存博客数据（覆盖写入 Blob）
 */
export async function savePosts(posts: any[]): Promise<void> {
  const jsonStr = JSON.stringify(posts, null, 2);

  await put(BLOB_KEY, jsonStr, {
    access: "public",
    contentType: "application/json",
  });

  console.log(`[Blob] Saved ${posts.length} posts to blob`);
}

/**
 * 删除 Blob 数据（慎用）
 */
export async function deletePostsBlob(): Promise<void> {
  try {
    await del(BLOB_KEY);
    console.log("[Blob] Deleted posts blob");
  } catch (e) {
    console.log("[Blob] Nothing to delete");
  }
}
