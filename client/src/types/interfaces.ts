import { FineTuneJobState, Model, Role } from "./types";

export interface Message {
  role: Role;
  content: string;
}

export interface Choice {
  message: {
    content: string;
  };
}

export interface ChatResult {
  choices: Choice[];
}

export interface ResultViewerProps {
  result: ChatResult;
  loading: boolean;
  stream: boolean;
}

export interface FineTuneStatus {
  id: string | number;
  status: FineTuneJobState;
  model: string;
  fine_tuned_model?: string;
}

export interface ChatCompletionPayload {
  model: Model;
  messages: Message[];
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  n?: number;
  user?: string | number | undefined;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: Message;
    finish_reason: string | null;
  }[];
}
