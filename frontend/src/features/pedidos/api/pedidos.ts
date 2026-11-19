import { axiosInstance } from "../../../shared/api/axiosInstance";
import type { Pedido, PedidoCreate, PedidosPaginados } from "../types/pedido";

export async function crearPedido(data: PedidoCreate) {
  const { data: pedido } = await axiosInstance.post("/pedidos", data);
  return pedido;
}

export async function getMisPedidos(): Promise<Pedido[]> {
  const { data } = await axiosInstance.get<PedidosPaginados>("/pedidos", {
    params: { skip: 0, limit: 50 },
  });
  return data.items;
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/cancelar`);
  return data;
}