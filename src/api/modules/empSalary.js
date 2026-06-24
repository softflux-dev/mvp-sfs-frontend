import ENDPOINTS from "../endpoints";
import api from "../index";
export const getMyPayslipsApi = (params = {}) =>
  api(ENDPOINTS.empGetMySalary, params, "get");