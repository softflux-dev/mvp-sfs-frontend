import { Navigate, Outlet } from "react-router-dom";
import useUserStore from "../zustand/useUserStore";

export const ProtectedLayout = () => {
  const { user } = useUserStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const AuthProtectedLayout = () => {
  const { user } = useUserStore();

  if (user) {
    return <Navigate to={"/"} replace />;
  }

  return <Outlet />;
};
