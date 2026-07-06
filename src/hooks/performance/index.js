import { useState, useCallback, useEffect } from "react";
import { getPerformanceOverviewApi } from "../../api/modules/performance";

export const usePerformance = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetchPerformance = useCallback(async (params = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await getPerformanceOverviewApi(params);
      if (res?.status === 200 || res?.status === 201) {
        setData(res.data.data);
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to fetch performance data.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      setError("Something went wrong.");
      return { success: false, message: "Something went wrong." };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPerformance(); }, [fetchPerformance]);

  return { data, loading, error, fetchPerformance };
};