import { useState } from "react";

import { handleApiError } from "../../../shared/api/handleApiError";
import { BadgeEstado } from "../../../shared/components/BadgeEstado";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { SkeletonGrid } from "../../../shared/components/Skeleton";
import { useCambiarEstado, useTodosLosPedidos } from "../../pedidos/hooks/usePedidosAdmin";
import type { EstadoPedido } from "../../pedidos/types/pedido";

const ESTADOS: EstadoPedido[] = ["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"];

const SIGUIENTES: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ["EN_PREPARACION", "CANCELADO"],
  EN_PREPARACION: ["ENTREGADO", "CANCELADO"],
  ENTREGADO: [],
  CANCELADO: [],
};

const ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "En preparación",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelar",
};

export function AdminPedidosPage() {
  const pedidos = useTodosLosPedidos();
  const cambiar = useCambiarEstado();
  const [filtro, setFiltro] = useState<EstadoPedido | "TODOS">("TODOS");
  const [error, setError] = useState<string | null>(null);

  const visibles = pedidos.data?.filter((p) => filtro === "TODOS" || p.estado === filtro) ?? [];

  function handleCambio(id: number, estado: EstadoPedido) {
    setError(null);
    cambiar.mutate(
      { id, estado },
      { onError: (err) => setError(handleApiError(err)) }
    );
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as EstadoPedido | "TODOS")}
          className="rounded border px-3 py-2"
        >
          <option value="TODOS">Todos los estados</option>
          {ESTADOS.map((estado) => (
            <option key={estado} value={estado}>
              {estado.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {pedidos.isPending && <SkeletonGrid cantidad={3} />}
      {pedidos.isError && <p className="text-red-600">No se pudieron cargar los pedidos.</p>}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {pedidos.data && visibles.length === 0 && (
        <EstadoVacio mensaje="No hay pedidos con ese estado." />
      )}

      <div className="flex flex-col gap-4">
        {visibles.map((pedido) => (
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
            </div>

            <ul className="mt-3 text-sm">
              {pedido.items.map((item) => (
                <li key={item.producto_id}>
                  {item.cantidad} × {item.nombre_producto}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm">
              <span className="font-medium">Entrega:</span> {pedido.direccion_entrega} ·{" "}
              {pedido.forma_pago}
            </p>

            {SIGUIENTES[pedido.estado].length > 0 && (
              <div className="mt-3 flex gap-2">
                {SIGUIENTES[pedido.estado].map((siguiente) => (
                  <button
                    key={siguiente}
                    disabled={cambiar.isPending}
                    onClick={() => handleCambio(pedido.id, siguiente)}
                    className={`rounded px-3 py-1 text-sm text-white disabled:opacity-40 ${
                      siguiente === "CANCELADO" ? "bg-red-600" : "bg-slate-900"
                    }`}
                  >
                    {ACCION[siguiente]}
                  </button>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}