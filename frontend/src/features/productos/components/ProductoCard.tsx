import { useCartStore } from "../../../store/cartStore";
import type { Producto } from "../types/producto";

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar);
  const sinStock = !producto.disponible || producto.stock === 0;

  return (
    <article className="flex flex-col rounded-xl bg-white p-4 shadow">
      <p className="text-xs uppercase text-slate-500">{producto.categoria.nombre}</p>
      <h2 className="text-lg font-semibold">{producto.nombre}</h2>
      {producto.descripcion && (
        <p className="flex-1 text-sm text-slate-600">{producto.descripcion}</p>
      )}
      <div className="mt-4 flex items-center justify-between">
        <span className="font-bold">${producto.precio_base.toFixed(2)}</span>
        <button
          disabled={sinStock}
          onClick={() =>
            agregar({
              producto_id: producto.id,
              nombre: producto.nombre,
              precio_unitario: producto.precio_base,
            })
          }
          className="rounded bg-slate-900 px-3 py-1 text-sm text-white disabled:opacity-40"
        >
          {sinStock ? "Sin stock" : "Agregar al carrito"}
        </button>
      </div>
    </article>
  );
}