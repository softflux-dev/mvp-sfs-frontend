// src/hooks/empSalary.js
import { useState, useCallback, useEffect } from "react";
import { getMyPayslipsApi } from "../../api/modules/empSalary";

export const useMyPayslips = (year) => {
  const [payslips,  setPayslips]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const fetchPayslips = useCallback(async (yr) => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyPayslipsApi({ year: yr || year });
      if (res?.status === 200 || res?.status === 201) {
        setPayslips(res.data.data.payslips || []);
        return { success: true };
      }
      const msg = res?.data?.message || "Failed to fetch salary data.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => { fetchPayslips(year); }, [year]);

  return { payslips, loading, error, fetchPayslips };
};