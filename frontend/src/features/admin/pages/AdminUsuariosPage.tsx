import { useState } from "react";

import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { SkeletonGrid } from "../../../shared/components/Skeleton";
import { useAuthStore } from "../../../store/authStore";
import { useCambiarEstadoUsuario, useUsuariosAdmin } from "../hooks/useUsuariosAdmin";

export function AdminUsuariosPage() {
  const usuarios = useUsuariosAdmin();
  const cambiar = useCambiarEstadoUsuario();
  const yo = useAuthStore((s) => s.usuario);
  const [error, setError] = useState<string | null>(null);

  function handleCambio(id: number, activar: boolean) {
    setError(null);
    cambiar.mutate(
      { id, activar },
      { onError: (err) => setError(handleApiError(err)) }
    );
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Usuarios</h1>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {usuarios.isPending && <SkeletonGrid cantidad={3} />}
      {usuarios.isError && <p className="text-red-600">No se pudieron cargar los usuarios.</p>}
      {usuarios.data && usuarios.data.length === 0 && (
        <EstadoVacio mensaje="No hay usuarios registrados." />
      )}

      {usuarios.data && usuarios.data.length > 0 && (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="p-3">Usuario</th>
                <th className="p-3">Nombre</th>
                <th className="p-3">Email</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.data.map((u) => (
                <tr key={u.id} className="border-b">
                  <td className="p-3 font-medium">{u.username}</td>
                  <td className="p-3">{u.full_name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">{u.disabled ? "Desactivado" : "Activo"}</td>
                  <td className="p-3">
                    {u.id !== yo?.id && (
                      <button
                        onClick={() => handleCambio(u.id, u.disabled)}
                        disabled={cambiar.isPending}
                        className={`rounded px-3 py-1 text-xs text-white disabled:opacity-40 ${
                          u.disabled ? "bg-green-600" : "bg-red-600"
                        }`}
                      >
                        {u.disabled ? "Activar" : "Desactivar"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}