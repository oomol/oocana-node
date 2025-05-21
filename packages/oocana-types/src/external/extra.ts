export type LLMModelOptions = {
  model: string;
  temperature: number;
  top_p: number;
  max_tokens: number;
};

export type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};
