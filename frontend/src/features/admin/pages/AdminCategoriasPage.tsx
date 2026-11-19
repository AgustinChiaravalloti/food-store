import { useState } from "react";

import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { SkeletonGrid } from "../../../shared/components/Skeleton";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import type { Categoria } from "../../categorias/types/categoria";
import type { CategoriaPayload } from "../api/categorias";
import { CategoriaForm } from "../components/CategoriaForm";
import { useDarDeBajaCategoria, useGuardarCategoria } from "../hooks/useCategoriasAdmin";

type Formulario = { modo: "crear" } | { modo: "editar"; categoria: Categoria } | null;

export function AdminCategoriasPage() {
  const categorias = useCategorias();
  const guardar = useGuardarCategoria();
  const darDeBaja = useDarDeBajaCategoria();
  const [formulario, setFormulario] = useState<Formulario>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGuardar(payload: CategoriaPayload) {
    const id = formulario?.modo === "editar" ? formulario.categoria.id : undefined;
    await guardar.mutateAsync({ id, data: payload });
    setFormulario(null);
  }

  function handleDarDeBaja(categoria: Categoria) {
    setError(null);
    darDeBaja.mutate(categoria.id, {
      onError: (err) => setError(handleApiError(err)),
    });
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <button
          onClick={() => setFormulario({ modo: "crear" })}
          className="rounded bg-slate-900 px-4 py-2 text-white"
        >
          Nueva categoría
        </button>
      </div>

      {formulario && (
        <div className="mb-6">
          <CategoriaForm
            key={formulario.modo === "editar" ? formulario.categoria.id : "nueva"}
            inicial={formulario.modo === "editar" ? formulario.categoria : undefined}
            onGuardar={handleGuardar}
            onCancelar={() => setFormulario(null)}
          />
        </div>
      )}

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {categorias.isPending && <SkeletonGrid cantidad={3} />}
      {categorias.isError && <p className="text-red-600">No se pudieron cargar las categorías.</p>}
      {categorias.data && categorias.data.length === 0 && (
        <EstadoVacio mensaje="Todavía no hay categorías cargadas." />
      )}

      {categorias.data && categorias.data.length > 0 && (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Descripción</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.data.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="p-3 font-medium">{c.nombre}</td>
                  <td className="p-3">{c.descripcion ?? "—"}</td>
                  <td className="p-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setFormulario({ modo: "editar", categoria: c })}
                        className="underline"
                      >
                        Editar
                      </button>
                      <button onClick={() => handleDarDeBaja(c)} className="text-red-600 underline">
                        Dar de baja
                      </button>
                    </div>
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