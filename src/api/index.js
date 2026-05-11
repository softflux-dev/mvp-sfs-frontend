// src/api/index.js
import axios from "axios";

export const baseUrl = "http://localhost:5000/api/";
// export const baseUrl = "https://your-production-url.com/api/";

const api = async (path, params, method, isMultipart = false) => {
  const userToken = localStorage.getItem("token");

  let url = path;
  if (method === "get" && params) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== "") {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    if (queryString) url = `${path}?${queryString}`;
  }

  const options = {
    headers: {
      ...(userToken && { Authorization: `Bearer ${userToken}` }),
      ...(!isMultipart && { "Content-Type": "application/json" }),
    },
    method,
    ...(method !== "get" && params && { data: params }),
  };

  try {
    const response = await axios(baseUrl + url, options);
    return response;
  } catch (error) {
    console.error("❌ API Error:", error);
    return error.response || { status: 500, data: { message: "Unknown error" } };
  }
};

export default api;