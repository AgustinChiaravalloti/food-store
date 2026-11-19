import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cancelarPedido, getMisPedidos } from "../api/pedidos";

export function useMisPedidos() {
  return useQuery({
    queryKey: ["pedidos", "mios"],
    queryFn: getMisPedidos,
  });
}

export function useCancelarPedido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelarPedido,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}