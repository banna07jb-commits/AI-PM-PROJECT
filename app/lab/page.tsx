"use client";

import LabContainer from "../../components/lab/LabContainer";

export default function LabPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] selection:bg-indigo-500/30">
      {/* Background Effects similar to main page but more subtle */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full mix-blend-screen filter blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto pt-10 px-6">
          <a href="/" className="inline-flex items-center text-gray-500 hover:text-white transition-colors text-sm mb-6">
            ← 返回主页
          </a>
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              AI Lab 🧪
            </h1>
            <p className="text-gray-400 mt-2">
              探索大模型的应用与赋能，优化 Prompt 或是生成你的专属 AI Assistant
            </p>
          </div>
        </div>
        <LabContainer />
      </div>
    </main>
  );
}
