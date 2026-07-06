import ENDPOINTS from "../endpoints";
import api       from "../index";

export const getPerformanceOverviewApi = (params) =>
  api(ENDPOINTS.getPerformanceOverview, params, "get");