import { axiosInstance } from "../../../shared/api/axiosInstance";
import type { ResumenPedidos } from "../types/resumen";

export async function getResumen(): Promise<ResumenPedidos> {
  const { data } = await axiosInstance.get<ResumenPedidos>("/pedidos/resumen");
  return data;
}