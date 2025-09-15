import { useState } from "react";

import ChatCompletionForm from "./features/chat/ChatCompletionForm";
import FineTuningForm from "./features/fine-tuning/FineTuningModel";

import { Toaster } from "react-hot-toast";
import { ActiveTab } from "./types/types";

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("chat");
  // here we put any type as required for greater freedom in the form of the examples.
  const [examples, setExamples] = useState<any>([]);
  return (
    <div className="min-h-screen bg-blue-100 p-6">
      {/* Notification window */}
      <Toaster
        position="top-center"
        gutter={12}
        containerStyle={{ margin: "8px" }}
        toastOptions={{
          success: {
            duration: 3000,
          },
          error: {
            duration: 5000,
          },
          style: {
            fontSize: "16px",
            maxWidth: "500px",
            padding: "16px 24px",
            backgroundColor: "#f6f6f6",
            color: "#393939",
          },
        }}
      />

      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === "chat" ? "border-b-2 border-black" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("chat")}
        >
          Чат с модел
        </button>
        <button
          className={`ml-2 px-4 py-2 font-semibold ${
            activeTab === "finetune"
              ? "border-b-2 border-black"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("finetune")}
        >
          Fine-tuning модел
        </button>
      </div>

      {activeTab === "chat" && <ChatCompletionForm />}
      {activeTab === "finetune" && (
        <FineTuningForm examples={examples} setExamples={setExamples} />
      )}
    </div>
  );
}

export default App;
