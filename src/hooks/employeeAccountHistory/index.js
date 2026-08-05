import { useState, useCallback } from "react";
import { getEmployeeAccountHistoryApi } from "../../api/modules/employee";

export const useEmployeeAccountHistory = () => {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const fetchHistory = useCallback(async (employeeId) => {
    if (!employeeId) return;
    setLoading(true);
    setError("");
    try {
      const res = await getEmployeeAccountHistoryApi(employeeId);
      if (res?.status === 200 || res?.status === 201) {
        setEvents(res.data.data.events || []);
      } else {
        setError(res?.data?.message || "Failed to load account history.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { events, loading, error, fetchHistory };
};