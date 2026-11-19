export function SkeletonGrid({ cantidad = 6 }: { cantidad?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="h-48 animate-pulse rounded-xl bg-slate-200" />
      ))}
    </div>
  );
}