import { Link } from "react-router-dom";

import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { useCartStore } from "../../../store/cartStore";

export function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const quitar = useCartStore((s) => s.quitar);
  const vaciar = useCartStore((s) => s.vaciar);

  const total = items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0);

  if (items.length === 0) {
    return (
      <section>
        <h1 className="mb-4 text-2xl font-bold">Carrito</h1>
        <EstadoVacio mensaje="Tu carrito está vacío." />
        <div className="text-center">
          <Link to="/" className="underline">
            Volver al catálogo
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Carrito</h1>

      <ul className="divide-y rounded-xl bg-white shadow">
        {items.map((item) => (
          <li key={item.producto_id} className="flex items-center justify-between gap-4 p-4">
            <div className="flex-1">
              <h2 className="font-semibold">{item.nombre}</h2>
              <p className="text-sm text-slate-600">
                ${item.precio_unitario.toFixed(2)} c/u
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                disabled={item.cantidad <= 1}
                className="rounded border px-2 py-1 disabled:opacity-40"
              >
                −
              </button>
              <span className="w-8 text-center">{item.cantidad}</span>
              <button
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                className="rounded border px-2 py-1"
              >
                +
              </button>
            </div>

            <span className="w-24 text-right font-semibold">
              ${(item.precio_unitario * item.cantidad).toFixed(2)}
            </span>

            <button onClick={() => quitar(item.producto_id)} className="text-sm text-red-600 underline">
              Quitar
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col items-end gap-3">
        <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
        <div className="flex gap-3">
          <button onClick={vaciar} className="rounded border px-4 py-2">
            Vaciar carrito
          </button>
          <Link to="/checkout" className="rounded bg-slate-900 px-4 py-2 text-white">
            Continuar compra
          </Link>
        </div>
      </div>
    </section>
  );
}