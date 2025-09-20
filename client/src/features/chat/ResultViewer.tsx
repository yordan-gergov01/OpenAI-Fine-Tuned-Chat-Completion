import { FiSend } from "react-icons/fi";

export function ResultViewer({ result, loading, stream }: any) {
  if (!result || !result.choices) {
    return loading ? (
      <p className="text-gray-500 font-medium">
        Зареждане<span className="loading-dots"></span>
      </p>
    ) : (
      <div className="flex flex-col items-center justify-center text-gray-500 mt-6 min-h-[200px] text-center">
        <FiSend className="text-4xl mb-2" />
        <p>Изпратете заявка, за да видите резултата тук.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Резултати</h2>
      {result.choices.map((choice: any, index: any) => (
        <div key={index} className="text-gray-600 whitespace-pre-line">
          <h3 className="font-medium text-gray-800 mb-1">
            Резултат {index + 1}
          </h3>
          <p>{choice.message.content}</p>
          {stream && loading && index === result.choices.length - 1 && (
            <span className="text-gray-400 animate-pulse">▌</span>
          )}
        </div>
      ))}
    </div>
  );
}
