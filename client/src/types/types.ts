export type ActiveTab = "chat" | "finetune";
export type Model = "gpt-4o" | "gpt-4-turbo" | "gpt-3.5-turbo";
export type Role = "system" | "user" | "assistant";
export type FineTuneJobState =
  | "pending"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";
export interface TrainingExample {
  system: string;
  user: string;
  assistant: string;
}
