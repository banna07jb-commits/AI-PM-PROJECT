"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("slug");

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(!!editSlug);

  const [post, setPost] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    tags: "",
    isPrivate: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("adminAuth");
      if (auth !== "true") {
        router.push("/admin");
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [router]);

  useEffect(() => {
    if (editSlug) {
      const fetchPost = async () => {
        try {
          const res = await fetch(`/api/blog/${editSlug}`);
          if (res.ok) {
            const data = await res.json();
            setPost({
              title: data.title,
              slug: data.slug,
              summary: data.summary,
              content: data.content,
              tags: data.tags ? data.tags.join(", ") : "",
              isPrivate: !!data.isPrivate,
            });
          } else {
            alert("无法获取文章信息");
            router.push("/admin");
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [editSlug, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Convert comma tags back to array
    const tagArray = post.tags.split(",").map(t => t.trim()).filter(Boolean);
    const payload = { ...post, tags: tagArray };
    
    // Determine method based on if we are editing an existing slug
    const method = editSlug ? "PUT" : "POST";
    // If we change slug while editing, it relies on the passed slug? Wait, the ?slug logic uses original.
    // So we ensure we send the original editSlug for PUT
    if (method === "PUT") {
      (payload as any).originalSlug = editSlug; 
      // Current API schema uses `slug` to identify. If slug changes, editing will fail.
      // So let's lock the slug UI for edits, or just keep it simple.
    }

    try {
      const res = await fetch("/api/blog", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        const data = await res.json();
        alert(data.error || "保存失败");
      }
    } catch (err) {
      console.error(err);
      alert("请求异常");
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertTextAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;

    setPost(prev => ({
      ...prev,
      content: val.substring(0, start) + text + val.substring(end)
    }));

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 10);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      insertTextAtCursor(`\n![上传中...]()\n`);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setPost(prev => ({
          ...prev,
          content: prev.content.replace(`![上传中...]()`, `![${file.name}](${data.url})`)
        }));
      } else {
        alert("图片上传失败");
        setPost(prev => ({
          ...prev,
          content: prev.content.replace(`\n![上传中...]()\n`, "")
        }));
      }
    } catch (err) {
      console.error(err);
      alert("上传网络异常");
    } finally {
      // clear file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-red-500/30 flex flex-col">
      {/* Immersive Top Bar */}
      <nav className="flex justify-between items-center py-4 px-8 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/admin")} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
            ← 返回面板
          </button>
          <div className="w-px h-6 bg-white/10"></div>
          <span className="text-gray-200 font-semibold">{editSlug ? "编辑文章" : "创作新文章"}</span>
        </div>
        
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer group">
            <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors tracking-wide">私有状态 🔒:</span>
            <div className={`w-12 h-6 rounded-full transition-colors relative ${post.isPrivate ? "bg-red-500" : "bg-white/10"}`}>
               <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${post.isPrivate ? "translate-x-6" : ""}`}></div>
            </div>
            <input type="checkbox" className="hidden" checked={post.isPrivate} onChange={e => setPost(p => ({ ...p, isPrivate: e.target.checked }))} />
          </label>

          <button 
            onClick={handleSave} 
            disabled={isSubmitting || !post.title || !post.slug || !post.content}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold tracking-wide hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          >
            {isSubmitting ? "保存中..." : (editSlug ? "更新发布" : "正式发布")}
          </button>
        </div>
      </nav>

      {/* Fullscreen Workspace */}
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-8">
        <div className="flex flex-col gap-6 w-full flex-1">
          {/* Header Metas */}
          <input 
            type="text" 
            placeholder="文章大标题..." 
            value={post.title} onChange={e => setPost(p => ({ ...p, title: e.target.value }))}
            className="w-full text-4xl md:text-5xl font-bold bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder:text-gray-700" 
          />
          
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" disabled={!!editSlug}
              placeholder="网页路由 Slug (如 test-blog)" 
              value={post.slug} onChange={e => setPost(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\\s+/g, "-") }))}
              className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-gray-300 focus:outline-none focus:border-white/20 transition-colors disabled:opacity-50" 
            />
            <input 
              type="text" 
              placeholder="标签 Tags (用逗号分隔)" 
              value={post.tags} onChange={e => setPost(p => ({ ...p, tags: e.target.value }))}
              className="flex-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-gray-300 focus:outline-none focus:border-white/20 transition-colors" 
            />
          </div>

          <textarea 
            rows={2} 
            placeholder="极简摘要..." 
            value={post.summary} onChange={e => setPost(p => ({ ...p, summary: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-gray-300 focus:outline-none focus:border-white/20 transition-colors resize-none mb-4" 
          />

          {/* Markdown Content Area */}
          <div className="flex flex-col flex-1 border border-white/10 rounded-2xl overflow-hidden bg-black/20 focus-within:border-white/30 transition-colors shadow-inner">
            <div className="flex items-center px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <span className="text-gray-500 font-mono text-xs uppercase tracking-widest flex-1">Markdown Context</span>
              
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                上传本地图片
              </button>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
            </div>
            <textarea 
              ref={textareaRef}
              placeholder="从这里开始撰写正文..." 
              value={post.content} onChange={e => setPost(p => ({ ...p, content: e.target.value }))}
              className="w-full flex-1 min-h-[500px] p-6 bg-transparent text-gray-300 font-mono leading-relaxed focus:outline-none focus:ring-0 resize-none" 
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function StandaloneEditor() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]"></div>}>
      <EditorContent />
    </Suspense>
  );
}
