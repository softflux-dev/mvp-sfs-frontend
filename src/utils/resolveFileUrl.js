import { baseUrl } from "../api/index";

const getBackendOrigin = () => baseUrl.replace(/\/api\/?$/, "");

export const resolveFileUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${getBackendOrigin()}${path}`;
};