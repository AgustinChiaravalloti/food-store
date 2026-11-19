import { axiosInstance } from "../../../shared/api/axiosInstance";
import type { Producto } from "../../productos/types/producto";

export interface ProductoPayload {
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  categoria_id: number;
}

export interface StockPayload {
  stock?: number;
  disponible?: boolean;
}

export async function crearProducto(data: ProductoPayload): Promise<Producto> {
  const { data: producto } = await axiosInstance.post<Producto>("/productos", data);
  return producto;
}

export async function actualizarProducto(id: number, data: ProductoPayload): Promise<Producto> {
  const { data: producto } = await axiosInstance.put<Producto>(`/productos/${id}`, data);
  return producto;
}

export async function actualizarStock(id: number, data: StockPayload): Promise<Producto> {
  const { data: producto } = await axiosInstance.patch<Producto>(`/productos/${id}/stock`, data);
  return producto;
}

export async function darDeBajaProducto(id: number): Promise<void> {
  await axiosInstance.delete(`/productos/${id}`);
}