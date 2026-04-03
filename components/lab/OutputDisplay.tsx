"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

interface OutputDisplayProps {
  content: string | null;
  isLoading: boolean;
}

export default function OutputDisplay({ content, isLoading }: OutputDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="lab-output-area">
        <div className="lab-output-inner">
          <div className="flex items-center gap-2 mb-4 text-[var(--lab-accent)]">
            <div className="lab-spinner"></div>
            <span className="text-sm font-medium">AI 正在思考...</span>
          </div>
          <div className="lab-loading">
            <div className="lab-skeleton-line"></div>
            <div className="lab-skeleton-line"></div>
            <div className="lab-skeleton-line"></div>
            <div className="lab-skeleton-line"></div>
          </div>
        </div>
      </div>
    );
  }

  if (content === null) {
    return (
      <div className="lab-output-area" style={{ background: "transparent", border: "1px dashed var(--lab-border)" }}>
        <div className="lab-empty-hint">优化结果将出现在这里...</div>
      </div>
    );
  }

  return (
    <div className="lab-output-area">
      <div className="lab-output-inner">
        <div className="lab-markdown">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {content}
          </ReactMarkdown>
        </div>
        <div className="flex justify-end mt-4">
          <button
            className={`lab-copy-btn ${copied ? "copied" : ""}`}
            onClick={handleCopy}
            disabled={copied}
          >
            {copied ? "✅ 已复制！" : "📋 复制"}
          </button>
        </div>
      </div>
    </div>
  );
}
