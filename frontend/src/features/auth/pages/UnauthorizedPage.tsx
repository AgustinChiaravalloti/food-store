import { Link } from "react-router-dom";

export function UnauthorizedPage() {
  return (
    <div className="mx-auto mt-16 max-w-sm text-center">
      <h1 className="mb-4 text-2xl font-bold">Sin permiso</h1>
      <p className="mb-4">No tenés acceso a esta sección.</p>
      <Link to="/" className="underline">Volver al inicio</Link>
    </div>
  );
}