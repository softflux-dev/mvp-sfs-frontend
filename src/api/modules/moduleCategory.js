// src/api/modules/moduleCategory.js
import api           from "../index";
import useUserStore  from "../../zustand/useUserStore";

const getBase = () => {
  const role = useUserStore.getState()?.user?.role;
  return role === "ADMIN" ? "admin/module-categories" : "pm/module-categories";
};

export const getModuleCategoriesApi = () =>
  api(getBase(), null, "get");

export const createModuleCategoryApi = (payload) =>
  api(getBase(), payload, "post");

export const updateModuleCategoryApi = (id, payload) =>
  api(`${getBase()}/${id}`, payload, "put");

export const deleteModuleCategoryApi = (id) =>
  api(`${getBase()}/${id}`, null, "delete");