import { NextRequest, NextResponse } from "next/server";
import { callDeepseek } from "@/lib/deepseek";

const OPTIMIZE_SYSTEM_PROMPT = `你是一个专业的 Prompt Engineering 专家。用户的输入是一个原始的 AI 提示词。
你的任务是将其优化为高质量的结构化 prompt。

优化规则：
1. 如果缺少角色设定，补充合适的角色（如"你是一位资深XXX专家"）
2. 明确输出格式（JSON/Markdown/代码块/列表等）
3. 添加 1-2 个具体示例（few-shot 引导）
4. 补充约束条件（长度、语气、禁止事项等）
5. 去除模糊表达，使其精确可执行
6. 保持原意不变，不添加用户未暗示的功能

请以以下格式输出（严格按此格式，不要偏离）：

---

## ✨ 优化后的 Prompt

[优化后的完整 prompt，用户可直接复制使用]

---

## 📊 优化说明

- **原问题**：...
- **优化动作**：...
- **为什么**：...
（列出 3-5 条关键优化点）`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body as { prompt?: string };

    // 输入校验
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "请输入内容后再试" },
        { status: 400 }
      );
    }

    if (prompt.trim().length < 10) {
      return NextResponse.json(
        { error: "内容太短，请提供更多细节（至少10个字符）" },
        { status: 400 }
      );
    }

    if (prompt.trim().length > 2000) {
      return NextResponse.json(
        { error: "内容过长，请精简后重试（2000字以内）" },
        { status: 400 }
      );
    }

    const result = await callDeepseek(OPTIMIZE_SYSTEM_PROMPT, prompt.trim(), {
      temperature: 0.7,
      max_tokens: 2000,
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("[API /lab/optimize] Error:", error);

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
