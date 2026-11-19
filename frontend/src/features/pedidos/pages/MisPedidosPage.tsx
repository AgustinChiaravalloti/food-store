import { useState } from "react";

import { handleApiError } from "../../../shared/api/handleApiError";
import { BadgeEstado } from "../../../shared/components/BadgeEstado";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { SkeletonGrid } from "../../../shared/components/Skeleton";
import { useCancelarPedido, useMisPedidos } from "../hooks/usePedidos";

export function MisPedidosPage() {
  const pedidos = useMisPedidos();
  const cancelar = useCancelarPedido();
  const [abierto, setAbierto] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleCancelar(id: number) {
    setError(null);
    cancelar.mutate(id, {
      onError: (err) => setError(handleApiError(err)),
    });
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Mis pedidos</h1>

      {pedidos.isPending && <SkeletonGrid cantidad={3} />}
      {pedidos.isError && <p className="text-red-600">No se pudieron cargar los pedidos.</p>}
      {pedidos.data && pedidos.data.length === 0 && (
        <EstadoVacio mensaje="Todavía no hiciste ningún pedido." />
      )}

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="flex flex-col gap-4">
        {pedidos.data?.map((pedido) => (
          <article key={pedido.id} className="rounded-xl bg-white p-4 shadow">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Pedido #{pedido.id}</h2>
                <p className="text-sm text-slate-600">
                  {new Date(pedido.created_at).toLocaleString("es-AR")}
                </p>
              </div>
              <BadgeEstado estado={pedido.estado} />
              <span className="font-bold">${pedido.total.toFixed(2)}</span>
              <button
                onClick={() => setAbierto(abierto === pedido.id ? null : pedido.id)}
                className="text-sm underline"
              >
                {abierto === pedido.id ? "Ocultar detalle" : "Ver detalle"}
              </button>
            </div>

            {abierto === pedido.id && (
              <div className="mt-4 border-t pt-4 text-sm">
                <ul className="mb-3 flex flex-col gap-1">
                  {pedido.items.map((item) => (
                    <li key={item.producto_id} className="flex justify-between">
                      <span>
                        {item.cantidad} × {item.nombre_producto}
                      </span>
                      <span>${item.subtotal.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <p>
                  <span className="font-medium">Dirección:</span> {pedido.direccion_entrega}
                </p>
                <p>
                  <span className="font-medium">Forma de pago:</span> {pedido.forma_pago}
                </p>
                {pedido.notas && (
                  <p>
                    <span className="font-medium">Notas:</span> {pedido.notas}
                  </p>
                )}

                {pedido.estado === "PENDIENTE" && (
                  <button
                    onClick={() => handleCancelar(pedido.id)}
                    disabled={cancelar.isPending}
                    className="mt-4 rounded border border-red-600 px-3 py-1 text-red-600 disabled:opacity-40"
                  >
                    {cancelar.isPending ? "Cancelando..." : "Cancelar pedido"}
                  </button>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}