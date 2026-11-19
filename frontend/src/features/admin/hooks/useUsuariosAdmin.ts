import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cambiarEstadoUsuario, getUsuarios } from "../api/usuarios";

export function useUsuariosAdmin() {
  return useQuery({
    queryKey: ["usuarios"],
    queryFn: getUsuarios,
  });
}

export function useCambiarEstadoUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) =>
      cambiarEstadoUsuario(id, activar),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["usuarios"] }),
  });
}