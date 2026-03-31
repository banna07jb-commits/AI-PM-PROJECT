"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Post {
  id: string;
  title: string;
  date: string;
  slug: string;
  isPrivate: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = sessionStorage.getItem("adminAuth");
      if (auth === "true") {
        setIsAuthenticated(true);
        fetchAllPosts();
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      sessionStorage.setItem("adminAuth", "true");
      setIsAuthenticated(true);
      setError("");
      fetchAllPosts();
    } else {
      setError("密码错误或权限被拒");
    }
  };

  const fetchAllPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blog?all=1");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("确定要永久删除这篇文章且无法恢复吗？")) return;
    try {
      const res = await fetch(`/api/blog/${slug}`, { method: "DELETE" });
      if (res.ok) {
        fetchAllPosts();
      } else {
        alert("删除失败");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 text-white font-sans">
        <form onSubmit={handleLogin} className="p-8 md:p-12 rounded-3xl bg-white/[0.03] border border-white/10 w-full max-w-sm backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-8">
            <span className="text-4xl mb-4 block">🛡️</span>
            <h2 className="text-2xl font-bold tracking-wider text-gray-200">Admin Control</h2>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Identity Verification..."
            className="w-full px-5 py-4 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-red-500 mb-4 transition-colors tracking-widest text-center placeholder:text-gray-600 placeholder:tracking-normal"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
          <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 font-bold text-lg hover:opacity-90 transition-opacity tracking-widest">
            UNLOCK
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 md:p-12 font-sans selection:bg-red-500/30">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-bold tracking-wider flex items-center gap-3">
              博客控制中心 <span className="text-red-500 bg-red-500/10 px-3 py-1 text-sm rounded-full tracking-normal">Admin</span>
            </h1>
            <a href="/#blog" className="text-gray-500 text-sm hover:text-white transition-colors mt-2 inline-block">← 返回公共博客列表</a>
          </div>
          <button 
            onClick={() => router.push("/admin/editor")}
            className="px-6 py-3 rounded-xl bg-white text-black font-bold tracking-wide hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            + 独立撰写空间
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
          {loading ? (
            <div className="p-20 flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-20 text-center text-gray-500 text-lg">当前数据舱为空。</div>
          ) : (
            <ul className="divide-y divide-white/5">
              {posts.map(post => (
                <li key={post.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/[0.03] transition-colors group gap-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-xl font-bold mb-2 truncate text-gray-200 flex items-center gap-3">
                      {post.title} 
                      {post.isPrivate && <span className="text-xs font-semibold px-2 py-1 bg-gray-800 text-gray-400 rounded-md border border-gray-700 font-mono tracking-widest flex items-center gap-1"><span className="text-[10px]">🔒</span> PRIVATE</span>}
                    </h3>
                    <div className="flex gap-4 text-sm text-gray-500 font-light font-mono mt-3">
                      <span>{post.date}</span>
                      <span className="truncate">/blog/{post.slug}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 transition-opacity">
                    <button 
                      onClick={() => router.push(`/admin/editor?slug=${post.slug}`)}
                      className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium text-sm"
                    >
                      修改
                    </button>
                    <button 
                      onClick={() => handleDelete(post.slug)}
                      className="px-5 py-2.5 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors font-medium text-sm"
                    >
                      删除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
