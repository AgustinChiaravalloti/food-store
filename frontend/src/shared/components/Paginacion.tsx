interface PaginacionProps {
  pagina: number;
  total: number;
  limit: number;
  onChange: (pagina: number) => void;
}

export function Paginacion({ pagina, total, limit, onChange }: PaginacionProps) {
  const ultimaPagina = Math.max(0, Math.ceil(total / limit) - 1);

  return (
    <div className="mt-6 flex items-center justify-center gap-4">
      <button
        disabled={pagina === 0}
        onClick={() => onChange(pagina - 1)}
        className="rounded border px-3 py-1 disabled:opacity-40"
      >
        Anterior
      </button>
      <span className="text-sm">
        Página {pagina + 1} de {ultimaPagina + 1}
      </span>
      <button
        disabled={pagina >= ultimaPagina}
        onClick={() => onChange(pagina + 1)}
        className="rounded border px-3 py-1 disabled:opacity-40"
      >
        Siguiente
      </button>
    </div>
  );
}