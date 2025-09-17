import {
  ChatCompletionPayload,
  ChatCompletionResponse,
} from "../types/interfaces";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const baseUrl = import.meta.env.VITE_BASE_URL;

export async function sendChatCompletionRequest(
  payload: ChatCompletionPayload,
  onChunk?: (chunk: string) => void
): Promise<ChatCompletionResponse | void> {
  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorResult = await response.json();
    throw new Error(
      errorResult?.error?.message || "Failed to send chat completion request."
    );
  }

  if (!payload.stream) {
    return await response.json();
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder("utf-8");

  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter((line) => line.trim() !== "");

    for (const line of lines) {
      if (line.startsWith("data:")) {
        const jsonData = line.replace(/^data: /, "");

        if (jsonData === "[DONE]") {
          return;
        }

        try {
          const parsedData = JSON.parse(jsonData);
          const delta: string | undefined =
            parsedData.choices?.[0]?.delta?.content;
          if (delta && onChunk) {
            onChunk(delta);
          }
        } catch (error) {
          console.error("Error parsing JSON chunk:", error);
        }
      }
    }
  }
}
