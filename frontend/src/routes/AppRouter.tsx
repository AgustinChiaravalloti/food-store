import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { UnauthorizedPage } from "../features/auth/pages/UnauthorizedPage";
import { AdminCategoriasPage } from "../features/admin/pages/AdminCategoriasPage";
import { AdminPedidosPage } from "../features/admin/pages/AdminPedidosPage";
import { AdminProductosPage } from "../features/admin/pages/AdminProductosPage";
import { AdminResumenPage } from "../features/admin/pages/AdminResumenPage";
import { AdminUsuariosPage } from "../features/admin/pages/AdminUsuariosPage";
import { CarritoPage } from "../features/carrito/pages/CarritoPage";
import { CheckoutPage } from "../features/checkout/pages/CheckoutPage";
import { CatalogoPage } from "../features/productos/pages/CatalogoPage";
import { MisPedidosPage } from "../features/pedidos/pages/MisPedidosPage";
import { MainLayout } from "../shared/layout/MainLayout";
import { AdminRoute } from "./AdminRoute";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin/resumen" element={<AdminResumenPage />} />
            <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
            <Route path="/admin/productos" element={<AdminProductosPage />} />
            <Route path="/admin/categorias" element={<AdminCategoriasPage />} />
            <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}