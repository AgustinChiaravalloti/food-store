import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  actualizarCategoria,
  crearCategoria,
  darDeBajaCategoria,
  type CategoriaPayload,
} from "../api/categorias";

function useInvalidarCatalogo() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: ["categorias"] });
    void queryClient.invalidateQueries({ queryKey: ["productos"] });
  };
}

export function useGuardarCategoria() {
  const invalidar = useInvalidarCatalogo();

  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: CategoriaPayload }) =>
      id ? actualizarCategoria(id, data) : crearCategoria(data),
    onSuccess: invalidar,
  });
}

export function useDarDeBajaCategoria() {
  const invalidar = useInvalidarCatalogo();

  return useMutation({
    mutationFn: darDeBajaCategoria,
    onSuccess: invalidar,
  });
}