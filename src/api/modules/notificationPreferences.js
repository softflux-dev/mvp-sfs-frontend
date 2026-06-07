import ENDPOINTS from "../endpoints";
import api       from "../index";

export const getNotificationPreferencesApi = () =>
  api(ENDPOINTS.getNotificationPreferences, null, "get");

export const updateNotificationPreferencesApi = (payload) =>
  api(ENDPOINTS.updateNotificationPreferences, payload, "put");