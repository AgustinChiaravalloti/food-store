import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
  children: ReactNode;
  rol?: "admin";
}

export function ProtectedRoute({ children, rol }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);

  if (cargando) return <p className="p-8">Cargando sesión...</p>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (rol && usuario.role !== rol) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
}