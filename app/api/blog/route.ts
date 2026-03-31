import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data/posts.json');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get('all') === '1';

    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    let posts = JSON.parse(fileContents);
    
    // Default security filter: non-admins only see public posts
    if (!fetchAll) {
      posts = posts.filter((p: any) => p.isPrivate !== true);
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Failed to read posts:', error);
    return NextResponse.json({ error: 'Failed to read posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newPost = await request.json();
    
    // Validate required fields
    if (!newPost.title || !newPost.slug || !newPost.content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    let posts = JSON.parse(fileContents);
    
    // Check if slug already exists
    if (posts.some((p: any) => p.slug === newPost.slug)) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    // Add unique ID
    newPost.id = Date.now().toString();
    if (!newPost.date) {
      // YYYY-MM-DD
      newPost.date = new Date().toISOString().split('T')[0];
    }
    if (!newPost.tags) {
      newPost.tags = [];
    }
    
    // Auto-init interaction schema & visibility
    newPost.likes = 0;
    newPost.comments = [];
    newPost.isPrivate = newPost.isPrivate === true;
    
    // Add to top of array (newest first)
    posts = [newPost, ...posts];
    
    await fs.writeFile(dataFilePath, JSON.stringify(posts, null, 2), 'utf8');
    
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Failed to save post:', error);
    return NextResponse.json({ error: 'Failed to save post' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updatedData = await request.json();
    
    if (!updatedData.slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    let posts = JSON.parse(fileContents);
    
    const postIndex = posts.findIndex((p: any) => p.slug === updatedData.slug);
    if (postIndex === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Preserve existing likes/comments/ID while updating content
    const existingPost = posts[postIndex];
    posts[postIndex] = {
      ...existingPost,
      title: updatedData.title || existingPost.title,
      summary: updatedData.summary || existingPost.summary,
      content: updatedData.content || existingPost.content,
      tags: updatedData.tags || existingPost.tags,
      isPrivate: updatedData.isPrivate !== undefined ? updatedData.isPrivate : existingPost.isPrivate,
    };
    
    await fs.writeFile(dataFilePath, JSON.stringify(posts, null, 2), 'utf8');
    
    return NextResponse.json(posts[postIndex], { status: 200 });
  } catch (error) {
    console.error('Failed to update post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}
