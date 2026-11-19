import { axiosInstance } from "../../../shared/api/axiosInstance";
import type { EstadoPedido, Pedido, PedidosPaginados } from "../types/pedido";

export async function getTodosLosPedidos(): Promise<Pedido[]> {
  const { data } = await axiosInstance.get<PedidosPaginados>("/pedidos", {
    params: { skip: 0, limit: 100 },
  });
  return data.items;
}

export async function cambiarEstadoPedido(id: number, estado: EstadoPedido): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${id}/estado`, { estado });
  return data;
}