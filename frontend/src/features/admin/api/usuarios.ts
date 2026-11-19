import { axiosInstance } from "../../../shared/api/axiosInstance";
import type { Usuario } from "../../auth/types/usuario";

export async function getUsuarios(): Promise<Usuario[]> {
  const { data } = await axiosInstance.get<Usuario[]>("/admin/usuarios");
  return data;
}

export async function cambiarEstadoUsuario(id: number, activar: boolean): Promise<void> {
  await axiosInstance.post(`/admin/usuarios/${id}/${activar ? "activar" : "desactivar"}`);
}