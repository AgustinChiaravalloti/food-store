import { useForm } from "@tanstack/react-form";
import { useState } from "react";

import { handleApiError } from "../../../shared/api/handleApiError";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import type { Producto } from "../../productos/types/producto";
import type { ProductoPayload } from "../api/productos";

interface ProductoFormProps {
  inicial?: Producto;
  onGuardar: (payload: ProductoPayload) => Promise<void>;
  onCancelar: () => void;
}

interface FormValues {
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string;
  stock: number;
  disponible: boolean;
  categoria_id: number;
}

export function ProductoForm({ inicial, onGuardar, onCancelar }: ProductoFormProps) {
  const categorias = useCategorias();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      nombre: inicial?.nombre ?? "",
      descripcion: inicial?.descripcion ?? "",
      precio_base: inicial?.precio_base ?? 0,
      imagen_url: inicial?.imagen_url ?? "",
      stock: inicial?.stock ?? 0,
      disponible: inicial?.disponible ?? true,
      categoria_id: inicial?.categoria_id ?? 0,
    } as FormValues,
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await onGuardar({
          nombre: value.nombre.trim(),
          descripcion: value.descripcion.trim() || null,
          precio_base: value.precio_base,
          imagen_url: value.imagen_url.trim() || null,
          stock: value.stock,
          disponible: value.disponible,
          categoria_id: value.categoria_id,
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
      className="grid gap-4 rounded-xl bg-white p-6 shadow sm:grid-cols-2"
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

      <form.Field
        name="categoria_id"
        validators={{
          onChange: ({ value }) => (value > 0 ? undefined : "Elegí una categoría"),
        }}
      >
        {(field) => (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Categoría</label>
            <select
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              className="rounded border px-3 py-2"
            >
              <option value={0} disabled>
                Elegí una categoría
              </option>
              {categorias.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-red-600">{field.state.meta.errors.join(", ")}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field name="precio_base">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Precio</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              className="rounded border px-3 py-2"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="stock">
        {(field) => (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Stock</label>
            <input
              type="number"
              min={0}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              className="rounded border px-3 py-2"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => (
          <div className="flex flex-col gap-1 sm:col-span-2">
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

      <form.Field name="imagen_url">
        {(field) => (
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm font-medium">URL de imagen (opcional)</label>
            <input
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="rounded border px-3 py-2"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.checked)}
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>

      <div className="flex items-center justify-end gap-3 sm:col-span-2">
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
              {isSubmitting ? "Guardando..." : inicial ? "Guardar cambios" : "Crear producto"}
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}