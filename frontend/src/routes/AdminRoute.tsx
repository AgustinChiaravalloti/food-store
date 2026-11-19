import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

export function AdminRoute() {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);

  if (cargando) return <p className="p-6">Cargando...</p>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (usuario.role !== "admin") return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
}