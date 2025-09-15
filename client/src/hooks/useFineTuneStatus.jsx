import { useEffect, useState, useRef } from 'react';

export function useFineTuneStatus(jobId, pollInterval = 5000) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isFirstFetch = useRef(true);

  useEffect(() => {
    if (!jobId || typeof jobId !== 'string' || jobId.trim() === '') return;

    let timeoutId;
    let cancelled = false;

    async function fetchStatus() {
      try {
        if (isFirstFetch.current) {
          setLoading(true);
        }

        const response = await fetch(
          `${import.meta.env.VITE_SERVER_BASE_URL}/fine-tune/${jobId}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Грешка при взимане на статус.');
        }

        setStatus(data);
        setError(null);

        if (
          data.status === 'succeeded' ||
          data.status === 'failed' ||
          data.status === 'cancelled'
        ) {
          return;
        }

        if (!cancelled) {
          timeoutId = setTimeout(fetchStatus, pollInterval);
        }
      } catch (error) {
        console.error('Error fetching status: ', error);
        setError(error);
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
