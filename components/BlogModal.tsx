"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
}

interface Post {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  date: string;
  slug: string;
  likes?: number;
  comments?: Comment[];
}

interface BlogModalProps {
  slug: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BlogModal({ slug, isOpen, onClose }: BlogModalProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Interaction State
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Reset states
      setPost(null);
      setHasLiked(false);
      setAuthor("");
      setContent("");
      setError(false);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Fetch Post Details
  useEffect(() => {
    if (isOpen && slug) {
      setLoading(true);
      setError(false);
      const fetchPost = async () => {
        try {
          const res = await fetch(`/api/blog/${slug}`);
          if (res.ok) {
            const data = await res.json();
            setPost(data);
            setLikes(data.likes || 0);
            setComments(data.comments || []);
          } else {
            setError(true);
          }
        } catch (err) {
          console.error(err);
          setError(true);
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [isOpen, slug]);

  const handleLike = async () => {
    if (hasLiked || !slug) return;
    setHasLiked(true);
    setLikes(prev => prev + 1); // UI optimistic update
    
    try {
      const response = await fetch(`/api/blog/${slug}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like' })
      });
      if (!response.ok) throw new Error("Like failed");
    } catch (err) {
      console.error('Failed to like', err);
      // Revert if failed
      setHasLiked(false);
      setLikes(prev => prev - 1);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !slug) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/blog/${slug}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'comment', author, content })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.post && data.post.comments) {
          setComments(data.post.comments);
        }
        setContent("");
      } else {
        alert("评论失败，请稍后再试。");
      }
    } catch (err) {
      console.error(err);
      alert("网络异常。");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-end sm:items-center p-0 sm:p-6 lg:p-12 transition-all duration-500 font-sans">
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0a0a0f]/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl h-[95vh] sm:h-[90vh] bg-[#0d0d14] sm:border border-white/10 sm:rounded-[2rem] rounded-t-[2rem] shadow-[0_-20px_60px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-20 duration-500">
        
        {/* Top Header / Drag Handle */}
        <div className="sticky top-0 z-20 flex justify-between items-center px-6 md:px-10 py-5 bg-[#0d0d14]/90 backdrop-blur-md border-b border-white/5">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer hover:bg-red-400 saturate-150 transition-colors shadow-[0_0_10px_rgba(239,68,68,0.5)]" onClick={onClose} title="关闭文章"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-sm font-medium tracking-widest uppercase">
            X
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {loading ? (
             <div className="w-full py-40 flex flex-col items-center justify-center">
                 <div className="w-10 h-10 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mb-4"></div>
                 <p className="text-gray-500 tracking-widest text-sm uppercase">正在解析博文</p>
             </div>
          ) : error || !post ? (
             <div className="w-full py-40 flex flex-col items-center justify-center space-y-4">
                 <h2 className="text-2xl font-bold text-red-500">404 - 未找到内容</h2>
                 <p className="text-gray-500">抱歉，无法加载这篇文章，它可能已被隐蔽或摧毁。</p>
             </div>
          ) : (
            <div className="px-6 md:px-14 py-10">
               {/* Article Header */}
               <header className="mb-16">
                 <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 leading-tight text-white">
                   {post.title}
                 </h1>
                 <div className="flex flex-wrap items-center gap-6 text-sm">
                   <span className="text-yellow-500 font-medium tracking-widest uppercase flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                     {post.date}
                   </span>
                   <div className="flex flex-wrap gap-2">
                     {post.tags.map(tag => (
                       <span key={tag} className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-gray-300 font-medium tracking-wide">
                         {tag}
                       </span>
                     ))}
                   </div>
                 </div>
               </header>

               {/* Markdown Body */}
               <article className="prose prose-invert prose-lg md:prose-xl prose-p:text-gray-300 prose-p:leading-relaxed prose-p:font-light prose-headings:text-white prose-headings:font-bold prose-a:text-yellow-500 hover:prose-a:text-yellow-400 prose-strong:text-white prose-strong:font-semibold prose-img:rounded-3xl prose-img:shadow-2xl prose-img:border prose-img:border-white/10 max-w-none">
                 <ReactMarkdown>
                   {post.content}
                 </ReactMarkdown>
               </article>

               {/* Interactions */}
               <div className="mt-20 pt-16 border-t border-white/10">
                 {/* Like Section */}
                 <div className="flex justify-center mb-20 relative">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-500/20 rounded-full blur-[40px] pointer-events-none"></div>
                   <button 
                     onClick={handleLike}
                     disabled={hasLiked}
                     className={`relative group flex flex-col items-center justify-center w-24 h-24 rounded-full border ${hasLiked ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-yellow-500/50 hover:text-yellow-400'} transition-all duration-500 shadow-[0_0_20px_rgba(234,179,8,0.1)] hover:shadow-[0_0_40px_rgba(234,179,8,0.3)] hover:-translate-y-1`}
                   >
                     <span className="text-4xl mb-1 group-hover:scale-110 transition-transform">{hasLiked ? '🤩' : '👍'}</span>
                     <span className="font-medium text-sm text-center w-full">{likes}</span>
                     {hasLiked && <div className="absolute -top-2 text-xl animate-ping opacity-0 duration-700">✨</div>}
                   </button>
                 </div>

                 {/* Comments */}
                 <div>
                   <h3 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
                     留言板 <span className="text-xs font-semibold text-black bg-yellow-500 px-3 py-1 rounded-full">{comments.length}</span>
                   </h3>

                   <form onSubmit={handleComment} className="mb-12 p-6 md:p-8 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                     <div className="flex flex-col md:flex-row gap-4 mb-4">
                       <input 
                         type="text" 
                         placeholder="你的称呼 (不填默认极客访客)" 
                         value={author}
                         onChange={e => setAuthor(e.target.value)}
                         className="flex-shrink-0 md:w-1/3 px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                       />
                       <input 
                         required
                         type="text" 
                         placeholder="写下你的连篇骚话..." 
                         value={content}
                         onChange={e => setContent(e.target.value)}
                         className="flex-1 px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                       />
                     </div>
                     <div className="flex justify-end">
                       <button 
                         type="submit" 
                         disabled={isSubmitting || !content.trim()}
                         className="px-8 py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-500 text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-sm tracking-wide"
                       >
                         {isSubmitting ? '发送中...' : '发射留言 🚀'}
                       </button>
                     </div>
                   </form>

                   <div className="space-y-6">
                     {comments.map((comment) => (
                       <div key={comment.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-[1.5rem] flex gap-4 transition-colors hover:bg-white/[0.04]">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center flex-shrink-0 text-white font-bold shadow-md">
                           {comment.author.charAt(0).toUpperCase()}
                         </div>
                         <div className="flex-1">
                           <div className="flex items-baseline gap-3 mb-2">
                             <span className="font-semibold text-gray-200 tracking-wide">{comment.author}</span>
                             <span className="text-xs text-gray-500 font-mono tracking-widest">{new Date(comment.date).toLocaleString()}</span>
                           </div>
                           <p className="text-gray-300 leading-relaxed font-light whitespace-pre-wrap">{comment.content}</p>
                         </div>
                       </div>
                     ))}
                     {comments.length === 0 && (
                       <div className="text-center py-16 bg-white/[0.01] rounded-2xl border border-white/5 border-dashed">
                         <p className="text-gray-500 font-light text-sm">暂无留言，这里是一片未被开拓的蛮荒之地。</p>
                       </div>
                     )}
                   </div>
                 </div>
               </div>
               
               <div className="mt-20 border-t border-white/5 pt-10 text-center pb-20">
                 <p className="text-gray-600 font-light text-xs tracking-widest uppercase">— End of Record —</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
