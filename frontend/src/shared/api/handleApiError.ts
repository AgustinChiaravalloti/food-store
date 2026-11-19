import { isAxiosError } from "axios";

export function handleApiError(error: unknown): string {
  if (!isAxiosError(error)) return "Ocurrió un error inesperado";

  const data = error.response?.data as { detail?: unknown } | undefined;
  const detail = data?.detail;

  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d: { msg?: string }) => d.msg ?? "Dato inválido").join(", ");
  }
  return "Error de conexión con el servidor";
}