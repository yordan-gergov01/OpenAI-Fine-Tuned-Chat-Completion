import { useState } from "react";
import { useEffect } from "react";

import { useFineTuneStatus } from "../../hooks/useFineTuneStatus";

import { GoQuestion } from "react-icons/go";
import { FiSend, FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";
import { Tooltip } from "react-tooltip";

import toast from "react-hot-toast";

import { Model, Role } from "../../types/types";

export default function FineTuningForm({
  examples,
  setExamples,
}: {
  examples: any;
  setExamples: any;
}) {
  const [model, setModel] = useState<Model>("gpt-3.5-turbo");
  const [current, setCurrent] = useState<any>({
    system: "",
    user: "",
    assistant: "",
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [openExampleIndex, setOpenExampleIndex] = useState<number | null>(null);

  // it might be useful to add custom errors somewhere near the form inputs in future
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [modelsLoading, setModelsLoading] = useState<boolean>(false);
  const [jobId, setJobId] = useState<string | number | null>(null);

  const {
    status,
    loading: statusLoading,
    error: statusError,
  } = useFineTuneStatus(jobId);

  function handleChange(role: Role, value: string) {
    setCurrent((prev: any) => ({ ...prev, [role]: value }));
  }

  function handleAddOrUpdate() {
    if (!current.system || !current.user || !current.assistant) {
      toast.error("И трите полета са задължителни за добавяне на нов пример.");
      return;
    }

    if (editIndex !== null) {
      const updated = [...examples];
      updated[editIndex] = { ...current };
      setExamples(updated);
      toast.success(`Пример ${editIndex + 1} е обновен.`);
    } else {
      setExamples((prev: any) => [...prev, { ...current }]);
      toast.success("Примерът е добавен.");
    }

    setCurrent({ system: "", user: "", assistant: "" });
    setEditIndex(null);
  }

  function handleEdit(index: number) {
    setCurrent({ ...examples[index] });
    setEditIndex(index);
  }

  function handleDelete(index: number) {
    const updated = [...examples];

    updated.splice(index, 1);
    setExamples(updated);

    toast.success(`Съобщение пример ${index + 1} беше изтрито.`);

    if (editIndex === index) {
      setCurrent({ system: "", user: "", assistant: "" });
      setEditIndex(null);
    }
  }

  function handleReset() {
    setExamples([]);
    setCurrent({ system: "", user: "", assistant: "" });
    setEditIndex(null);
    setError(null);
    setJobId(null);
  }

  async function handleSubmit() {
    const jsonlArray = examples.map((example: any) => ({
      messages: [
        { role: "system", content: example.system },
        { role: "user", content: example.user },
        { role: "assistant", content: example.assistant },
      ],
    }));

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_SERVER_BASE_URL}/upload`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: jsonlArray, model }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Обучението беше изпратено и запазено успешно!");
        setJobId(data.jobId);
      } else {
        toast.error(`Грешка при записването: \n ${data.message}`);
        setError(new Error(data.message));
      }
    } catch (error) {
      console.error("Request error: ", error);
      toast.error("Възникна грешка при изпращането на обучение.");
      setError(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status?.status === "succeeded") {
      toast.success("Fine-tuning завърши успешно.");
    }
  }, [status?.status]);

  useEffect(() => {
    async function fetchModels() {
      setModelsLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_BASE_URL}/models`
        );
        const data = await response.json();

        setAvailableModels(data.models);
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
          Обучи своя AI асистент
        </h2>

        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="w-full md:w-96 mb-7">
            <label className="font-medium block">
              Добави примери към модел:
              <GoQuestion
                data-tooltip-id="model-tooltip"
                data-tooltip-content="Избери модела, към който искаш да изпратиш примери за обучение."
                className="inline ml-1"
              />
              <Tooltip id="model-tooltip" />
            </label>
            <select
              className="w-full sm:w-80 border rounded px-2 py-1 mt-2"
              value={modelsLoading ? "Зареждане..." : model}
              onChange={(e) => setModel(e.target.value)}
            >
              {modelsLoading ? (
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Система</label>
            <textarea
              className="border rounded px-2 py-1 h-28"
              placeholder="System роля – напр. 'Ти си полезен асистент.'"
              value={current.system}
              onChange={(e) => handleChange("system", e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Потребител</label>
            <textarea
              className="border rounded px-2 py-1 h-28"
              placeholder="User съобщение – напр. 'Какво е времето в София?'"
              value={current.user}
              onChange={(e) => handleChange("user", e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Асистент</label>
            <textarea
              className="border rounded px-2 py-1 h-28"
              placeholder="Assistant отговор – напр. 'В момента е 20°C и слънчево в София.'"
              value={current.assistant}
              onChange={(e) => handleChange("assistant", e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleAddOrUpdate}
          className="mt-4 flex items-center gap-2 border px-4 py-2 rounded hover:bg-gray-100"
        >
          <FiPlus />
          {editIndex !== null
            ? `Обнови пример ${editIndex + 1}`
            : "Добави пример"}
        </button>

        <div className="mt-6 space-y-2">
          {examples.map((ex: any, idx: number) => (
            <details
              key={idx}
              className="border rounded p-3 bg-gray-50 group"
              open={openExampleIndex === idx}
            >
              <summary
                className="font-semibold cursor-pointer flex justify-between items-center"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenExampleIndex((prev) => (prev === idx ? null : idx));
                }}
              >
                <span>Пример {idx + 1}</span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800"
                    onClick={(e) => {
                      e.preventDefault();
                      handleEdit(idx);
                    }}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-800"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(idx);
                    }}
                  >
                    <FiTrash2 />
                  </button>
                </span>
              </summary>
              <div className="mt-2 text-sm space-y-1">
                <p>
                  <strong>System:</strong> {ex.system}
                </p>
                <p>
                  <strong>User:</strong> {ex.user}
                </p>
                <p>
                  <strong>Assistant:</strong> {ex.assistant}
                </p>
              </div>
            </details>
          ))}
        </div>

        <div className="flex gap-4 mt-4">
          <button
            className={`text-white px-4 py-2 rounded ${
              examples.length >= 10
                ? "bg-black hover:bg-gray-800"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={handleSubmit}
            disabled={examples.length < 10 || loading}
          >
            <FiSend className="inline mr-2" />
            {loading ? "Изпращане..." : "Изпрати за обучение"}
          </button>
          <button
            onClick={handleReset}
            className="border border-gray-400 px-4 py-2 rounded"
          >
            Изчисти
          </button>
        </div>

        {jobId && (
          <div className="mt-6 p-4 border rounded bg-gray-50 w-full">
            <h3 className="font-bold mb-2">Статус на обучение</h3>

            {statusLoading && !status && <p>Зареждане на статус...</p>}

            {statusError && (
              <p className="text-red-500">Грешка: {statusError.message}</p>
            )}

            {status && (
              <>
                <ul className="space-y-1 text-sm mb-4">
                  <li>
                    <strong>Job ID:</strong> {status.id}
                  </li>
                  <li>
                    <strong>Статус:</strong> {status.status}
                  </li>
                  <li>
                    <strong>Модел:</strong> {status.model}
                  </li>
                  {status.fine_tuned_model && (
                    <li>
                      <strong>Fine-tuned модел:</strong>{" "}
                      {status.fine_tuned_model}
                    </li>
                  )}
                </ul>

                {status.status !== "succeeded" &&
                  status.status !== "failed" && (
                    <div className="flex items-center gap-2 text-blue-600 text-sm">
                      <svg
                        className="animate-spin h-5 w-5 text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      <span>
                        Fine-tuning процесът все още е активен. Това може да
                        отнеме време. Моля, изчакайте...
                      </span>
                    </div>
                  )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
