"use client";

import React, { useState } from "react";
import InputArea from "./InputArea";
import OutputDisplay from "./OutputDisplay";

const SKILL_EXAMPLES = [
  "我想要一个能帮我写周报的助手",
  "一个精通 SQL 查询优化的数据库顾问",
  "一个能帮我想英文名字的创意助手",
  "一个模拟用户进行产品测试的 QA 专家"
];

export default function SkillGenerator() {
  const [output, setOutput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (text: string) => {
    setIsLoading(true);
    setOutput(null);
    try {
      const res = await fetch("/api/lab/generate-skill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text }),
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
        placeholder='描述你想要的 AI 助手能力，比如："我想要一个能帮我写周报的助手"'
        examples={SKILL_EXAMPLES}
        buttonText="🛠️ 生成 Skill"
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />
      <OutputDisplay content={output} isLoading={isLoading} />
    </div>
  );
}
