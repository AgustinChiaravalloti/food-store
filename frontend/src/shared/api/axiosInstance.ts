import axios, { type AxiosError } from "axios";

import { useAuthStore } from "../../store/authStore";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Rutas donde un 401 o un 400 de cuenta desactivada son respuestas esperadas
const RUTAS_DE_SESION = ["/auth/token", "/auth/me"];

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string }>) => {
    const url = error.config?.url ?? "";
    const esRutaDeSesion = RUTAS_DE_SESION.some((ruta) => url.endsWith(ruta));
    const status = error.response?.status;
    const detail = error.response?.data?.detail;
    const cuentaDesactivada =
      status === 400 && detail === "Cuenta de usuario desactivada";

    if (!esRutaDeSesion && (status === 401 || cuentaDesactivada)) {
      void useAuthStore.getState().logout();
      window.location.assign("/login");
    }
    return Promise.reject(error);
  }
);