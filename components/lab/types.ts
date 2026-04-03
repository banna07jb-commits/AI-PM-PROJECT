/**
 * AI Lab 共享类型定义
 */

export type LabTab = "optimize" | "generate-skill";

export interface LabApiRequest {
  /** Prompt 优化时 = 原始 prompt；Skill 生成时 = 能力描述 */
  input: string;
}

export interface LabApiResponse {
  /** Markdown 格式的结果内容 */
  result: string;
}

/** Tab 配置 */
export interface TabConfig {
  id: LabTab;
  label: string;
  icon: string; // emoji 或图标名
  placeholder: string;
  buttonText: string;
  apiEndpoint: string;
  examples: string[];
}
