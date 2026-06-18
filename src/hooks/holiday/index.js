// src/hooks/holiday.js — NEW FILE
import { useState, useCallback, useEffect } from "react";
import {
  getHolidaysApi,
  createHolidayApi,
  updateHolidayApi,
  deleteHolidayApi,
} from "../../api/modules/holiday";

const defaultFilters = {
  search:  "",
  type:    "",
  payType: "",
  year:    "",
  page:    1,
  limit:   10,
};

export const useHoliday = () => {
  const [holidays,     setHolidays]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error,        setError]        = useState("");
  const [filters,      setFilters]      = useState(defaultFilters);
  const [pagination,   setPagination]   = useState({ total: 0, totalPages: 0, page: 1, limit: 10 });

  const fetchHolidays = useCallback(async (customParams = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page:    customParams.page    ?? filters.page,
        limit:   customParams.limit   ?? filters.limit,
        search:  customParams.search  ?? filters.search,
        type:    customParams.type    ?? filters.type,
        payType: customParams.payType ?? filters.payType,
        year:    customParams.year    ?? filters.year,
      };
      Object.keys(params).forEach((k) => {
        if (params[k] === "" || params[k] == null) delete params[k];
      });

      const response = await getHolidaysApi(params);
      if (response?.status === 200 || response?.status === 201) {
        const { holidays: data, pagination: pg } = response.data.data;
        setHolidays(Array.isArray(data) ? data : []);
        if (pg) setPagination(pg);
        return { success: true };
      }
      const msg = response?.data?.message || "Failed to fetch holidays.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createHoliday = useCallback(async (payload) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await createHolidayApi(payload);
      if (response?.status === 200 || response?.status === 201) {
        await fetchHolidays();
        return {
          success: true,
          message: response.data.message,
          overlapWarning: response.data.data?.overlapWarning || null,
        };
      }
      const msg = response?.data?.message || "Failed to create holiday.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  }, [fetchHolidays]);

  const updateHoliday = useCallback(async (id, payload) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await updateHolidayApi(id, payload);
      if (response?.status === 200 || response?.status === 201) {
        await fetchHolidays();
        return { success: true, message: response.data.message };
      }
      const msg = response?.data?.message || "Failed to update holiday.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  }, [fetchHolidays]);

  const deleteHoliday = useCallback(async (id) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await deleteHolidayApi(id);
      if (response?.status === 200 || response?.status === 201) {
        await fetchHolidays();
        return { success: true, message: "Holiday deleted successfully." };
      }
      const msg = response?.data?.message || "Failed to delete holiday.";
      setError(msg);
      return { success: false, message: msg };
    } catch {
      const msg = "Something went wrong.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setActionLoading(false);
    }
  }, [fetchHolidays]);

  const handlePageChange = useCallback((event, newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage + 1 }));
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setFilters((prev) => ({ ...prev, limit: parseInt(event.target.value, 10), page: 1 }));
  }, []);

  const handleFilterChange = useCallback((values = {}) => {
    setFilters((prev) => ({ ...prev, ...values, page: 1 }));
  }, []);

  useEffect(() => { fetchHolidays(); }, [filters]);

  return {
    holidays, loading, actionLoading, error, pagination, filters,
    fetchHolidays, createHoliday, updateHoliday, deleteHoliday,
    handlePageChange, handleRowsPerPageChange, handleFilterChange,
  };
};