"use client";

import React, { useState } from "react";
import InputArea from "./InputArea";
import OutputDisplay from "./OutputDisplay";

const PROMPT_EXAMPLES = [
  "帮我写一篇关于人工智能的文章",
  "用 Python 分析 Excel 销售数据",
  "给我推荐一些适合周末看的电影",
  "写一封求职邮件给字节跳动的产品经理岗位"
];

export default function PromptOptimizer() {
  const [output, setOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (text: string) => {
    setIsLoading(true);
    // output set to null later logic if error, here we keep it as null for loading
    setOutput(null);
    try {
      const res = await fetch("/api/lab/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOutput(`**Error:** ${data.error || "请求失败，请稍后重试"}`);
      } else {
        setOutput(data.result);
      }
    } catch (err) {
      setOutput(`**Error:** 网络或解析错误`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <InputArea
        placeholder='输入你想优化的 AI 提示词，比如："帮我写一篇关于人工智能的文章"'
        examples={PROMPT_EXAMPLES}
        buttonText="✨ 开始优化"
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />
      <OutputDisplay content={output} isLoading={isLoading} />
    </div>
  );
}
