import { Link, useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const cantidadCarrito = useCartStore((s) =>
    s.items.reduce((acc, i) => acc + i.cantidad, 0)
  );
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Aunque falle la llamada, la sesión local ya se limpia en el store
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <header className="flex items-center justify-between bg-slate-900 px-6 py-3 text-white">
      <Link to="/" className="text-lg font-bold">
        Food Store
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link to="/carrito">Carrito ({cantidadCarrito})</Link>
        {usuario ? (
          <>
            <Link to="/mis-pedidos">Mis pedidos</Link>
            {usuario.role === "admin" && (
              <>
                <Link to="/admin/resumen">Resumen</Link>
                <Link to="/admin/pedidos">Pedidos</Link>
                <Link to="/admin/productos">Productos</Link>
                <Link to="/admin/categorias">Categorías</Link>
                <Link to="/admin/usuarios">Usuarios</Link>
              </>
            )}
            <span className="text-slate-300">
              {usuario.full_name} ({usuario.role})
            </span>
            <button onClick={handleLogout} className="underline">
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link to="/login">Ingresar</Link>
        )}
      </nav>
    </header>
  );
}