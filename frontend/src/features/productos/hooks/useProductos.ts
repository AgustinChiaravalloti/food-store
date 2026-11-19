import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getProductos, type FiltrosProductos } from "../api/productos";

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ["productos", filtros],
    queryFn: () => getProductos(filtros),
    placeholderData: keepPreviousData,
  });
}