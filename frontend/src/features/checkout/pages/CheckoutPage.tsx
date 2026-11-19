import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { handleApiError } from "../../../shared/api/handleApiError";
import { useAuthStore } from "../../../store/authStore";
import { useCartStore } from "../../../store/cartStore";
import { crearPedido } from "../../pedidos/api/pedidos";
import type { FormaPago } from "../../pedidos/types/pedido";

interface CheckoutValues {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string;
}

export function CheckoutPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const items = useCartStore((s) => s.items);
  const vaciar = useCartStore((s) => s.vaciar);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      direccion_entrega: "",
      forma_pago: "EFECTIVO",
      notas: "",
    } as CheckoutValues,
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        await crearPedido({
          items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim() || null,
        });
        vaciar();
        navigate("/mis-pedidos", { replace: true });
      } catch (err) {
        setError(handleApiError(err));
      }
    },
  });

  if (!usuario) return <Navigate to="/login" replace />;
  if (items.length === 0) return <Navigate to="/carrito" replace />;

  const total = items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0);

  return (
    <section className="mx-auto max-w-xl">
      <h1 className="mb-4 text-2xl font-bold">Confirmar pedido</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
        className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow"
      >
        <form.Field
          name="direccion_entrega"
          validators={{
            onChange: ({ value }) => {
              const largo = value.trim().length;
              if (largo < 5) return "La dirección debe tener al menos 5 caracteres";
              if (largo > 200) return "La dirección no puede superar los 200 caracteres";
              return undefined;
            },
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-1">
              <label htmlFor="direccion" className="text-sm font-medium">
                Dirección de entrega
              </label>
              <input
                id="direccion"
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

        <form.Field name="forma_pago">
          {(field) => (
            <div className="flex flex-col gap-1">
              <label htmlFor="forma_pago" className="text-sm font-medium">
                Forma de pago
              </label>
              <select
                id="forma_pago"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value as FormaPago)}
                className="rounded border px-3 py-2"
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>
          )}
        </form.Field>

        <form.Field name="notas">
          {(field) => (
            <div className="flex flex-col gap-1">
              <label htmlFor="notas" className="text-sm font-medium">
                Notas (opcional)
              </label>
              <textarea
                id="notas"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="rounded border px-3 py-2"
              />
            </div>
          )}
        </form.Field>

        <div className="flex items-center justify-between border-t pt-4">
          <span className="font-bold">Total: ${total.toFixed(2)}</span>
          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-40"
              >
                {isSubmitting ? "Enviando..." : "Confirmar pedido"}
              </button>
            )}
          </form.Subscribe>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      <div className="mt-4 text-center">
        <Link to="/carrito" className="underline">
          Volver al carrito
        </Link>
      </div>
    </section>
  );
}