import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getProductos } from "../../productos/api/productos";
import {
  actualizarProducto,
  actualizarStock,
  crearProducto,
  darDeBajaProducto,
  type ProductoPayload,
  type StockPayload,
} from "../api/productos";

export function useProductosAdmin() {
  return useQuery({
    queryKey: ["productos", "admin"],
    queryFn: async () => (await getProductos({ page: 0, limit: 100 })).items,
  });
}

export function useGuardarProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: ProductoPayload }) =>
      id ? actualizarProducto(id, data) : crearProducto(data),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["productos"] }),
  });
}

export function useActualizarStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StockPayload }) =>
      actualizarStock(id, data),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["productos"] }),
  });
}

export function useDarDeBajaProducto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: darDeBajaProducto,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["productos"] }),
  });
}