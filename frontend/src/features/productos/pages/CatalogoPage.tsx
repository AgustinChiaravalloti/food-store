import { useState } from "react";

import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Paginacion } from "../../../shared/components/Paginacion";
import { SkeletonGrid } from "../../../shared/components/Skeleton";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import { ProductoCard } from "../components/ProductoCard";
import { useProductos } from "../hooks/useProductos";

const LIMIT = 12;

export function CatalogoPage() {
  const [pagina, setPagina] = useState(0);
  const [search, setSearch] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

  const categorias = useCategorias();
  const productos = useProductos({ page: pagina, limit: LIMIT, search, categoriaId });

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Catálogo</h1>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          placeholder="Buscar por nombre"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagina(0);
          }}
          className="flex-1 rounded border px-3 py-2"
        />
        <select
          value={categoriaId ?? ""}
          onChange={(e) => {
            setCategoriaId(e.target.value ? Number(e.target.value) : undefined);
            setPagina(0);
          }}
          className="rounded border px-3 py-2"
        >
          <option value="">Todas las categorías</option>
          {categorias.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {productos.isPending && <SkeletonGrid />}
      {productos.isError && (
        <p className="text-red-600">No se pudieron cargar los productos.</p>
      )}
      {productos.data && productos.data.items.length === 0 && (
        <EstadoVacio mensaje="No hay productos para estos filtros." />
      )}
      {productos.data && productos.data.items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productos.data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion
            pagina={pagina}
            total={productos.data.total}
            limit={LIMIT}
            onChange={setPagina}
          />
        </>
      )}
    </section>
  );
}