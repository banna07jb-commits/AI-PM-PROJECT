import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data/posts.json');

// Next.js 14.2+ dynamic API route signature
type Params = { params: Promise<{ slug: string }> | { slug: string } };

export async function GET(request: Request, context: Params) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const { slug } = resolvedParams;

    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const posts = JSON.parse(fileContents);
    
    const post = posts.find((p: any) => p.slug === slug);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Failed to read post:', error);
    return NextResponse.json({ error: 'Failed to read post' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: Params) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const { slug } = resolvedParams;

    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    let posts = JSON.parse(fileContents);
    
    const initialLength = posts.length;
    posts = posts.filter((p: any) => p.slug !== slug);
    
    if (posts.length === initialLength) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    await fs.writeFile(dataFilePath, JSON.stringify(posts, null, 2), 'utf8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
