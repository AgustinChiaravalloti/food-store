import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cambiarEstadoPedido, getTodosLosPedidos } from "../api/pedidosAdmin";
import type { EstadoPedido } from "../types/pedido";

export function useTodosLosPedidos() {
  return useQuery({
    queryKey: ["pedidos", "todos"],
    queryFn: getTodosLosPedidos,
  });
}

export function useCambiarEstado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      cambiarEstadoPedido(id, estado),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
      void queryClient.invalidateQueries({ queryKey: ["resumen"] });
    },
  });
}