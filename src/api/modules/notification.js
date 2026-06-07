// src/api/modules/notification.js
import ENDPOINTS from "../endpoints";
import api       from "../index";


export const getNotificationsApi = (params) =>
  api("notifications", params, "get");

export const markNotificationReadApi = (notificationId) =>
  api(`notifications/${notificationId}/read`, null, "patch");

export const markAllNotificationsReadApi = () =>
  api("notifications/read-all", null, "patch");