import { useEffect, useState, useRef } from "react";
import { FineTuneStatus } from "../types/interfaces";

export function useFineTuneStatus(
  jobId: string | number | null,
  pollInterval = 5000
) {
  const [status, setStatus] = useState<FineTuneStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const isFirstFetch = useRef(true);

  useEffect(() => {
    if (!jobId || (typeof jobId === "string" && jobId.trim() === "")) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let cancelled = false;

    async function fetchStatus() {
      try {
        if (isFirstFetch.current) {
          setLoading(true);
        }

        const response = await fetch(
          `${import.meta.env.VITE_SERVER_BASE_URL}/fine-tune/${jobId}`
        );
        const data: FineTuneStatus = await response.json();

        if (!response.ok) {
          throw new Error(
            (data as any).message || "Грешка при взимане на статус."
          );
        }

        setStatus(data);
        setError(null);

        if (
          data.status === "succeeded" ||
          data.status === "failed" ||
          data.status === "cancelled"
        ) {
          return;
        }

        if (!cancelled) {
          timeoutId = setTimeout(fetchStatus, pollInterval);
        }
      } catch (error) {
        console.error("Error fetching status: ", error);
        setError(error instanceof Error ? error : new Error("Unknown error"));
      } finally {
        if (isFirstFetch.current) {
          setLoading(false);
          isFirstFetch.current = false;
        }
      }
    }

    fetchStatus();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [jobId, pollInterval]);

  return { status, loading, error };
}
