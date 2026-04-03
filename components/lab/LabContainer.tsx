"use client";

import React, { useState } from "react";
import PromptOptimizer from "./PromptOptimizer";
import SkillGenerator from "./SkillGenerator";

export default function LabContainer() {
  const [activeTab, setActiveTab] = useState<"optimize" | "generate-skill">("optimize");

  return (
    <div className="lab-container">
      <div className="lab-tab-bar">
        <button
          className={`lab-tab ${activeTab === "optimize" ? "active" : ""}`}
          onClick={() => setActiveTab("optimize")}
        >
          ⚡ Prompt 优化
        </button>
        <button
          className={`lab-tab ${activeTab === "generate-skill" ? "active" : ""}`}
          onClick={() => setActiveTab("generate-skill")}
        >
          🛠️ Skill 生成
        </button>
      </div>

      <div className="lab-content flex-1 w-full mt-4">
        {activeTab === "optimize" ? <PromptOptimizer /> : <SkillGenerator />}
      </div>
    </div>
  );
}
