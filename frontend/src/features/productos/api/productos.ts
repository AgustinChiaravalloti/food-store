import { axiosInstance } from "../../../shared/api/axiosInstance";
import type { ProductosPaginados } from "../types/producto";

export interface FiltrosProductos {
  page: number;
  limit: number;
  search?: string;
  categoriaId?: number;
}

export async function getProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  const { data } = await axiosInstance.get<ProductosPaginados>("/productos", {
    params: {
      skip: filtros.page * filtros.limit,
      limit: filtros.limit,
      search: filtros.search || undefined,
      categoria_id: filtros.categoriaId,
    },
  });
  return data;
}