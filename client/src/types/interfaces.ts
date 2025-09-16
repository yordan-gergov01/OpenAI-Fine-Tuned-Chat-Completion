import { Role } from "./types";

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
