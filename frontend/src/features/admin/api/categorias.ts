import { axiosInstance } from "../../../shared/api/axiosInstance";
import type { Categoria } from "../../categorias/types/categoria";

export interface CategoriaPayload {
  nombre: string;
  descripcion: string | null;
}

export async function crearCategoria(data: CategoriaPayload): Promise<Categoria> {
  const { data: categoria } = await axiosInstance.post<Categoria>("/categorias", data);
  return categoria;
}

export async function actualizarCategoria(id: number, data: CategoriaPayload): Promise<Categoria> {
  const { data: categoria } = await axiosInstance.put<Categoria>(`/categorias/${id}`, data);
  return categoria;
}

export async function darDeBajaCategoria(id: number): Promise<void> {
  await axiosInstance.delete(`/categorias/${id}`);
}