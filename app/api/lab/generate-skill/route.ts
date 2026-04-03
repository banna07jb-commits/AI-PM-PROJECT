import { NextRequest, NextResponse } from "next/server";
import { callDeepseek } from "@/lib/deepseek";

const SKILL_SYSTEM_PROMPT = `你是一个 AI System Prompt 设计师。用户会描述一个想要的 AI 助手能力，
你的任务是为这个能力生成完整的、可立即使用的 System Prompt。

请以以下格式输出（严格按此格式，不要偏离）：

---

## 🎯 System Prompt

[完整的 system prompt，复制到任何支持自定义 system prompt 的 AI 助手中即可使用]

---

## 📖 使用说明

- **适用场景**：...
- **如何使用**：将上面的 System Prompt 配置到...
- **效果预期**：...

---
## 💡 进阶建议

- 可以添加的功能：...
- 进阶用法：...`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description } = body as { description?: string };

    // 输入校验
    if (!description || typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        { error: "请输入内容后再试" },
        { status: 400 }
      );
    }

    if (description.trim().length < 5) {
      return NextResponse.json(
        { error: "请提供更多细节（至少5个字符）" },
        { status: 400 }
      );
    }

    if (description.trim().length > 2000) {
      return NextResponse.json(
        { error: "内容过长，请精简后重试（2000字以内）" },
        { status: 400 }
      );
    }

    const result = await callDeepseek(
      SKILL_SYSTEM_PROMPT,
      description.trim(),
      {
        temperature: 0.8,
        max_tokens: 2000,
      }
    );

    return NextResponse.json({ result });
  } catch (error) {
    console.error("[API /lab/generate-skill] Error:", error);

    const message =
      error instanceof Error ? error.message : "未知错误";

    if (message.includes("not configured")) {
      return NextResponse.json(
        { error: "服务暂未就绪，请联系管理员" },
        { status: 503 }
      );
    }

    if (message.includes("timeout") || message.includes("abort")) {
      return NextResponse.json(
        { error: "请求超时，请检查网络后重试" },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: "AI 服务繁忙，请稍后重试" },
      { status: 500 }
    );
  }
}
