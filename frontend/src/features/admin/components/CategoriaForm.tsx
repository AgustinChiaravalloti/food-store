import { useForm } from "@tanstack/react-form";
import { useState } from "react";

import { handleApiError } from "../../../shared/api/handleApiError";
import type { Categoria } from "../../categorias/types/categoria";
import type { CategoriaPayload } from "../api/categorias";

interface CategoriaFormProps {
  inicial?: Categoria;
  onGuardar: (payload: CategoriaPayload) => Promise<void>;
  onCancelar: () => void;
}

interface FormValues {
  nombre: string;
  descripcion: string;
}

export function CategoriaForm({ inicial, onGuardar, onCancelar }: CategoriaFormProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      nombre: inicial?.nombre ?? "",
      descripcion: inicial?.descripcion ?? "",
    } as FormValues,
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await onGuardar({
          nombre: value.nombre.trim(),
          descripcion: value.descripcion.trim() || null,
        });
      } catch (err) {
        setError(handleApiError(err));
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      className="grid gap-4 rounded-xl bg-white p-6 shadow"
    >
      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) =>
            value.trim().length < 2 || value.trim().length > 100
              ? "El nombre debe tener entre 2 y 100 caracteres"
              : undefined,
        }}
      >
        {(field) => (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Nombre</label>
            <input
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="rounded border px-3 py-2"
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-600">{field.state.meta.errors.join(", ")}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Descripción (opcional)</label>
            <textarea
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="rounded border px-3 py-2"
            />
          </div>
        )}
      </form.Field>

      <div className="flex items-center justify-end gap-3">
        {error && <p className="mr-auto text-sm text-red-600">{error}</p>}
        <button type="button" onClick={onCancelar} className="rounded border px-4 py-2">
          Cancelar
        </button>
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-40"
            >
              {isSubmitting ? "Guardando..." : inicial ? "Guardar cambios" : "Crear categoría"}
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}