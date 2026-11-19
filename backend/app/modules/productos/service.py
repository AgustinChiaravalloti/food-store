from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.model import Producto
from app.modules.productos.schema import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork

# Campos que no admiten null en la base: si llegan como null en el PUT, se ignoran
NO_NULOS = {"nombre", "precio_base", "stock", "disponible", "categoria_id"}


class ProductoNoEncontrado(Exception):
    pass


class ProductoService:
    def __init__(self) -> None:
        self.uow = ProductoUnitOfWork()

    def _activo(self, uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado()
        return producto

    def _categoria_activa(self, uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada()

    def listar(
        self,
        *,
        skip: int,
        limit: int,
        texto: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            items, total = uow.productos.buscar(
                skip=skip,
                limit=limit,
                texto=texto,
                categoria_id=categoria_id,
                disponible=disponible,
            )
            return ProductosPaginados(
                total=total,
                items=[ProductoRead.model_validate(p) for p in items],
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._activo(uow, producto_id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._categoria_activa(uow, data.categoria_id)
            producto = uow.productos.add(Producto(**data.model_dump()))
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        cambios = {
            k: v
            for k, v in data.model_dump(exclude_unset=True).items()
            if not (k in NO_NULOS and v is None)
        }
        with self.uow as uow:
            producto = self._activo(uow, producto_id)
            if "categoria_id" in cambios:
                self._categoria_activa(uow, cambios["categoria_id"])
            for campo, valor in cambios.items():
                setattr(producto, campo, valor)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        cambios = data.model_dump(exclude_none=True)
        with self.uow as uow:
            producto = self._activo(uow, producto_id)
            for campo, valor in cambios.items():
                setattr(producto, campo, valor)
            return ProductoRead.model_validate(producto)

    def dar_de_baja(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = self._activo(uow, producto_id)
            producto.activo = False