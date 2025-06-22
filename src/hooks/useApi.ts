import { useEffect, useState } from "react";

interface TimeAnalysis {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "pending" | "processing" | "completed" | "error";
  error_message?: string;
  created_at: string;
  updated_at: string;
  days: Day[];
  days_count: number;
}

interface Day {
  id: number;
  date: string;
  sentiment: number;
  sentiment_label: string;
  message_count: number;
  created_at: string;
}

interface ApiFilters {
  start_date?: string;
  end_date?: string;
  status?: string;
  time_analysis?: number;
}

export const useTimeAnalyses = (filters?: ApiFilters) => {
  const [data, setData] = useState<TimeAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (filters?.start_date)
          params.append("start_date", filters.start_date);
        if (filters?.end_date) params.append("end_date", filters.end_date);
        if (filters?.status) params.append("status", filters.status);

        const response = await fetch(
          `/api/time-analyses/?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result.results || result); // Handle paginated or direct array response
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters?.start_date, filters?.end_date, filters?.status]);

  return { data, loading, error };
};

export const useDays = (filters?: ApiFilters) => {
  const [data, setData] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (filters?.start_date)
          params.append("start_date", filters.start_date);
        if (filters?.end_date) params.append("end_date", filters.end_date);
        if (filters?.time_analysis)
          params.append("time_analysis", filters.time_analysis.toString());

        const response = await fetch(`/api/days/?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result.results || result); // Handle paginated or direct array response
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters?.start_date, filters?.end_date, filters?.time_analysis]);

  return { data, loading, error };
};
