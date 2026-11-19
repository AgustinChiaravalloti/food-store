import { useState } from "react";

import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { SkeletonGrid } from "../../../shared/components/Skeleton";
import type { Producto } from "../../productos/types/producto";
import type { ProductoPayload } from "../api/productos";
import { ProductoForm } from "../components/ProductoForm";
import {
  useActualizarStock,
  useDarDeBajaProducto,
  useGuardarProducto,
  useProductosAdmin,
} from "../hooks/useProductosAdmin";

type Formulario = { modo: "crear" } | { modo: "editar"; producto: Producto } | null;

function StockCell({ producto, onGuardar }: { producto: Producto; onGuardar: (stock: number) => void }) {
  const [valor, setValor] = useState(String(producto.stock));

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="w-20 rounded border px-2 py-1"
      />
      <button onClick={() => onGuardar(Number(valor))} className="text-sm underline">
        Guardar
      </button>
    </div>
  );
}

export function AdminProductosPage() {
  const productos = useProductosAdmin();
  const guardar = useGuardarProducto();
  const actualizarStock = useActualizarStock();
  const darDeBaja = useDarDeBajaProducto();
  const [formulario, setFormulario] = useState<Formulario>(null);
  const [error, setError] = useState<string | null>(null);

  function handleError(err: unknown) {
    setError(handleApiError(err));
  }

  async function handleGuardar(payload: ProductoPayload) {
    const id = formulario?.modo === "editar" ? formulario.producto.id : undefined;
    await guardar.mutateAsync({ id, data: payload });
    setFormulario(null);
  }

  function handleStock(producto: Producto, stock: number) {
    setError(null);
    actualizarStock.mutate({ id: producto.id, data: { stock } }, { onError: handleError });
  }

  function handleDisponible(producto: Producto) {
    setError(null);
    actualizarStock.mutate(
      { id: producto.id, data: { disponible: !producto.disponible } },
      { onError: handleError }
    );
  }

  function handleDarDeBaja(producto: Producto) {
    setError(null);
    darDeBaja.mutate(producto.id, { onError: handleError });
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <button
          onClick={() => setFormulario({ modo: "crear" })}
          className="rounded bg-slate-900 px-4 py-2 text-white"
        >
          Nuevo producto
        </button>
      </div>

      {formulario && (
        <div className="mb-6">
          <ProductoForm
            key={formulario.modo === "editar" ? formulario.producto.id : "nuevo"}
            inicial={formulario.modo === "editar" ? formulario.producto : undefined}
            onGuardar={handleGuardar}
            onCancelar={() => setFormulario(null)}
          />
        </div>
      )}

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {productos.isPending && <SkeletonGrid cantidad={3} />}
      {productos.isError && <p className="text-red-600">No se pudieron cargar los productos.</p>}
      {productos.data && productos.data.length === 0 && (
        <EstadoVacio mensaje="Todavía no hay productos cargados." />
      )}

      {productos.data && productos.data.length > 0 && (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="p-3">Producto</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Precio</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Disponible</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.data.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="p-3 font-medium">{p.nombre}</td>
                  <td className="p-3">{p.categoria.nombre}</td>
                  <td className="p-3">${p.precio_base.toFixed(2)}</td>
                  <td className="p-3">
                    <StockCell producto={p} onGuardar={(stock) => handleStock(p, stock)} />
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDisponible(p)}
                      className={`rounded px-2 py-1 text-xs text-white ${
                        p.disponible ? "bg-green-600" : "bg-slate-400"
                      }`}
                    >
                      {p.disponible ? "Sí" : "No"}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setFormulario({ modo: "editar", producto: p })}
                        className="underline"
                      >
                        Editar
                      </button>
                      <button onClick={() => handleDarDeBaja(p)} className="text-red-600 underline">
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