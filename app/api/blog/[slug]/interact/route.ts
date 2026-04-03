import { NextResponse } from 'next/server';
import { getPosts, savePosts } from "@/lib/blob";

type Params = { params: Promise<{ slug: string }> | { slug: string } };

export async function POST(request: Request, context: Params) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const { slug } = resolvedParams;
    const body = await request.json();
    
    const posts = await getPosts();
    
    const postIndex = posts.findIndex((p: any) => p.slug === slug);
    if (postIndex === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    const post = posts[postIndex];

    if (body.action === 'like') {
      post.likes = (post.likes || 0) + 1;
    } else if (body.action === 'comment') {
      if (!body.content || !body.content.trim()) {
        return NextResponse.json({ error: '评论内容不能为空' }, { status: 400 });
      }
      const newComment = {
        id: Date.now().toString(),
        author: body.author?.trim() || '匿名极客',
        content: body.content.trim(),
        date: new Date().toISOString()
      };
      if (!Array.isArray(post.comments)) {
        post.comments = [];
      }
      post.comments.push(newComment);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Save back to file
    posts[postIndex] = post;
    await savePosts(posts);

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Failed to interact with post:', error);
    return NextResponse.json({ error: 'Interaction failed' }, { status: 500 });
  }
}
