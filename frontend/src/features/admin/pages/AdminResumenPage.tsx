import { useQuery } from "@tanstack/react-query";

import { SkeletonGrid } from "../../../shared/components/Skeleton";
import { getResumen } from "../api/resumen";

export function AdminResumenPage() {
  const resumen = useQuery({
    queryKey: ["resumen"],
    queryFn: getResumen,
  });

  if (resumen.isPending) return <SkeletonGrid cantidad={6} />;
  if (resumen.isError) return <p className="text-red-600">No se pudo cargar el resumen.</p>;

  const datos = resumen.data;
  const tarjetas = [
    { titulo: "Pendientes", valor: datos.pendientes },
    { titulo: "En preparación", valor: datos.en_preparacion },
    { titulo: "Entregados", valor: datos.entregados },
    { titulo: "Cancelados", valor: datos.cancelados },
    { titulo: "Pedidos de hoy", valor: datos.pedidos_hoy },
    { titulo: "Ingresos entregados", valor: `$${datos.ingresos_entregados.toFixed(2)}` },
  ];

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Resumen</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tarjetas.map((t) => (
          <div key={t.titulo} className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">{t.titulo}</p>
            <p className="mt-2 text-3xl font-bold">{t.valor}</p>
          </div>
        ))}
      </div>
    </section>
  );
}