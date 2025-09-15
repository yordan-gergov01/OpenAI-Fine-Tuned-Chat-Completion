import { useState, useEffect } from "react";

import { FiSend } from "react-icons/fi";
import { GoQuestion } from "react-icons/go";

import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

import { sendChatCompletionRequest } from "../../services/apiOpenAI";
import toast from "react-hot-toast";

import { ResultViewer } from "./ResultViewer";
import { Model } from "../../types/types";

const defaultModels: Model[] = ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"];

export default function ChatCompletionForm() {
  const [model, setModel] = useState<Model>("gpt-4o");
  const [availableModels, setAvailableModels] =
    useState<Model[]>(defaultModels);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [topP, setTopP] = useState<number>(1);
  const [n, setN] = useState<number>(1);
  const [stream, setStream] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const [messages, setMessages] = useState([
    { role: "system", content: "" },
    { role: "user", content: "" },
    { role: "assistant", content: "" },
  ]);
  const [result, setResult] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelsLoding, setModelsLoading] = useState(false);

  function resetForm() {
    setModel("gpt-4o");
    setTemperature(0.7);
    setTopP(1);
    setN(1);
    setStream(false);
    setUserId("");
    setMessages([
      { role: "system", content: "" },
      { role: "user", content: "" },
      { role: "assistant", content: "" },
    ]);
    setResult(null);
    setError(null);
  }

  function handleRoleContentChange(role, value) {
    const updated = messages.map((msg) =>
      msg.role === role ? { ...msg, content: value } : msg
    );

    setMessages(updated);
  }

  async function handleSendRequest() {
    try {
      setLoading(true);
      setResult(null);
      setError(null);

      const singleMessage = messages.find((msg) => msg.content.trim() !== "");

      if (!singleMessage) {
        const errorMessage =
          "Съдържанието на съобщението не може да бъде празно.";
        toast.error(errorMessage);
        setError(new Error(errorMessage));
        return;
      }

      if (stream && n > 1) {
        const errorMessage =
          "При stream режим броят на отговорите (N) трябва да е 1.";
        toast.error(errorMessage);
        setError(new Error(errorMessage));
        return;
      }

      if (stream) {
        setResult({ choices: [{ message: { content: "" } }] });

        await sendChatCompletionRequest(
          {
            model,
            messages,
            temperature: parseFloat(temperature),
            top_p: parseFloat(topP),
            n: 1,
            stream: true,
            user: userId || undefined,
          },
          (chunk) => {
            setResult((prev) => {
              const prevContent = prev?.choices?.[0]?.message?.content || "";
              return {
                choices: [
                  {
                    message: {
                      content: prevContent + chunk,
                    },
                  },
                ],
              };
            });
          }
        );
      } else {
        const apiResult = await sendChatCompletionRequest({
          model,
          messages,
          temperature: parseFloat(temperature),
          top_p: parseFloat(topP),
          n: parseInt(n),
          stream: false,
          user: userId || undefined,
        });
        const choices = apiResult.choices.map((choice) => ({
          message: {
            content: choice.message.content,
          },
        }));

        setResult({ choices });
      }
    } catch (error) {
      console.error("Request error: ", error);
      toast.error("Възникна грешка при изпращането на заявката.");
      setError(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchModels() {
      setModelsLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_BASE_URL}/models`
        );
        const data = await response.json();

        if (Array.isArray(data.models)) {
          setAvailableModels((prev) => {
            const newModels = data.models.filter(
              (model) => !prev.includes(model)
            );
            return [...prev, ...newModels];
          });
        }
      } catch (error) {
        console.error("Error fetching fine-tuned models: ", error);
      } finally {
        setModelsLoading(false);
      }
    }

    fetchModels();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="p-6 bg-white rounded-lg shadow-md space-y-6 w-full">
        <h2 className="text-xl font-semibold gap-2 flex items-center">
          <span className="inline-flex items-center">
            <FiSend />
          </span>
          Попитай OpenAI
        </h2>

        <div className="flex flex-wrap gap-4">
          <div className="w-full sm:w-auto">
            <label className="block font-medium">
              Модел
              <span>
                <GoQuestion
                  data-tooltip-id="model-tooltip"
                  data-tooltip-content="Избери версия на модела (напр. GPT-4, GPT-3.5), с който искаш да говориш."
                  data-tooltip-place="top"
                  data-tooltip-effect="solid"
                  className="inline ml-1"
                />
                <Tooltip id="model-tooltip" />
              </span>
            </label>
            <select
              className="w-full sm:w-80 border rounded px-2 py-1 mt-2"
              value={modelsLoding ? "Зареждане..." : model}
              onChange={(e) => setModel(e.target.value)}
            >
              {modelsLoding ? (
                <option disabled>Зареждане...</option>
              ) : (
                availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="w-full sm:w-auto">
            <label className="block font-medium">
              Креативност (отговор)
              <span>
                <GoQuestion
                  data-tooltip-id="temperature-tooltip"
                  data-tooltip-content="Колкото по-висока стойност, толкова по-креативен и непредсказуем е отговорът."
                  data-tooltip-place="top"
                  data-tooltip-effect="solid"
                  className="inline ml-1"
                />
                <Tooltip id="temperature-tooltip" />
              </span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="2"
              className="w-full sm:w-48 border rounded px-2 py-1 mt-2"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-auto">
            <label className="block font-medium">
              Вероятностен праг
              <span>
                <GoQuestion
                  data-tooltip-id="top-p-tooltip"
                  data-tooltip-content="Ограничава избора само до най-вероятните думи. По-ниско = по-фокусирани отговори."
                  data-tooltip-place="top"
                  data-tooltip-effect="solid"
                  className="inline ml-1"
                />
                <Tooltip id="top-p-tooltip" />
              </span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="1"
              className="w-full sm:w-48 border rounded px-2 py-1 mt-2"
              value={topP}
              onChange={(e) => setTopP(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-auto">
            <label className="block font-medium">
              Брой отговори
              <span>
                <GoQuestion
                  data-tooltip-id="n-tooltip"
                  data-tooltip-content="Колко различни отговора да генерира AI. Работи само ако стриймингът е изключен."
                  data-tooltip-place="top"
                  data-tooltip-effect="solid"
                  className="inline ml-1"
                />
                <Tooltip id="n-tooltip" />
              </span>
            </label>
            <input
              type="number"
              min="1"
              className="w-full sm:w-48 border rounded px-2 py-1 mt-2"
              value={n}
              onChange={(e) => setN(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-auto">
            <label className="block font-medium">
              Стрийминг
              <span>
                <GoQuestion
                  data-tooltip-id="stream-tooltip"
                  data-tooltip-content="Ако е включено, ще виждаш отговора докато се генерира (на живо)."
                  data-tooltip-place="top"
                  data-tooltip-effect="solid"
                  className="inline ml-1"
                />
                <Tooltip id="stream-tooltip" />
              </span>
            </label>
            <label className="flex items-center gap-2 mt-2 font-medium">
              <input
                type="checkbox"
                checked={stream}
                onChange={(e) => setStream(e.target.checked)}
              />
              Активирай стрийминг
            </label>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-md space-y-6 mb-6">
          <h3 className="font-medium mb-2">
            Въведи съобщения (чат история)
            <span>
              <GoQuestion
                data-tooltip-id="messages-tooltip"
                data-tooltip-content="Всяко съобщение има роля (потребител, асистент или система) и съдържание."
                data-tooltip-place="top"
                data-tooltip-effect="solid"
                className="inline ml-1"
              />
              <Tooltip id="messages-tooltip" />
            </span>
          </h3>

          <div className="flex flex-col md:flex-row gap-4">
            {messages.map((msg) => (
              <div
                key={msg.role}
                className="flex flex-col flex-1 min-w-[250px]"
              >
                <label className="font-semibold mb-1">
                  {msg.role === "user"
                    ? "Потребител"
                    : msg.role === "assistant"
                    ? "Асистент"
                    : "Система"}
                </label>
                <textarea
                  value={msg.content}
                  onChange={(e) =>
                    handleRoleContentChange(msg.role, e.target.value)
                  }
                  className="border rounded px-2 py-1"
                  rows={4}
                  placeholder="Въведете съдържанието..."
                />
              </div>
            ))}
          </div>
        </div>

        {/* <div className="flex justify-between items-start w-full">
          
        {/* Uncomment the following block if you want to include User ID input */}
        {/* <div className="flex flex-col gap-1 text-left">
            <label className="font-medium text-start">
              User ID
              <span>
                <GoQuestion
                  data-tooltip-id="identifier-tooltip"
                  data-tooltip-content="Уникален ID на потребителя за проследяване."
                  data-tooltip-place="top"
                  data-tooltip-effect="solid"
                  className="inline ml-1"
                />
                <Tooltip id="identifier-tooltip" />
              </span>
            </label>
            <input
              type="text"
              className="border rounded px-2 py-1 w-60"
              placeholder="Въведете User ID (по избор)"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div> */}
        {/* </div> */}
        <div className="flex gap-4">
          <button
            onClick={handleSendRequest}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            <FiSend className="inline mr-2" />
            Изпрати заявка
          </button>
          <button
            onClick={resetForm}
            className="border border-gray-400 px-4 py-2 rounded"
          >
            Изчисти
          </button>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-md space-y-6 mt-2 w-full max-h-[80vh] overflow-y-auto">
        <ResultViewer result={result} loading={loading} stream={stream} />
      </div>
    </div>
  );
}
