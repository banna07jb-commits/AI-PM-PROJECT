/**
 * Vercel Blob Client
 * 博客数据存储（替代本地 fs 读写 posts.json）
 */

import { put, head, del } from "@vercel/blob";
import { readFile } from "fs/promises";
import { join } from "path";

const BLOB_KEY = "data/posts.json";

export function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

/**
 * 获取博客数据（所有文章）
 */
export async function getPosts(): Promise<any[]> {
  // 尝试从 Blob 获取
  try {
    const headResult = await head(BLOB_KEY);
    if (headResult) {
      const res = await fetch(`${headResult.url}?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        console.log("[Blob] Loaded posts from blob (cache-busted)");
        return JSON.parse(text);
      }
    }
  } catch (e: any) {
    console.log(`[Blob] head/fetch failed: ${e.message}`);
  }

  // 初始化：从本地 data/posts.json 导入
  try {
    const localData = await readFile(join(process.cwd(), "data/posts.json"), "utf8");
    const posts = JSON.parse(localData);
    console.log(`[Blob] Initialized with ${posts.length} local posts`);
    return posts;
  } catch (e: any) {
    console.error("[Blob] No local data found either:", e.message);
    return [];
  }
}

/**
 * 保存博客数据（覆盖写入 Blob）
 */
export async function savePosts(posts: any[]): Promise<void> {
  const jsonStr = JSON.stringify(posts, null, 2);

  try {
    const result = await put(BLOB_KEY, jsonStr, {
      access: "public",
      allowOverwrite: true,
      contentType: "application/json",
    });
    console.log(`[Blob] Saved ${posts.length} posts to blob, url: ${result.url}`);
  } catch (e: any) {
    console.error(`[Blob] put() failed: ${e.message}`, e);
    throw new Error(`Blob save failed: ${e.message}`);
  }
}

/**
 * 删除 Blob 数据
 */
export async function deletePostsBlob(): Promise<void> {
  try {
    await del(BLOB_KEY);
    console.log("[Blob] Deleted posts blob");
  } catch (e) {
    // ignore
  }
}
