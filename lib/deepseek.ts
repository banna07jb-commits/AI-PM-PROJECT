/**
 * DeepSeek API Client
 * 封装 DeepSeek Chat Completions API 调用
 *
 * 环境变量要求：
 * DEEPSEEK_API_KEY - 在 Vercel 项目设置中配置
 */

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

export interface DeepseekMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface DeepseekOptions {
  temperature?: number;
  max_tokens?: number;
}

/**
 * 调用 DeepSeek Chat API
 */
export async function callDeepseek(
  systemPrompt: string,
  userMessage: string,
  options: DeepseekOptions = {}
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY not configured");
  }

  const messages: DeepseekMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  const body = {
    model: "deepseek-chat",
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 2000,
  };

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("[DeepSeek API Error]", response.status, errorData);
    throw new Error(
      `DeepSeek API error: ${response.status} - ${
        errorData?.error?.message || "Unknown error"
      }`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Invalid response from DeepSeek API");
  }

  return content;
}
