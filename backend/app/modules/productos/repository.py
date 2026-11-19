from sqlalchemy import func
from sqlmodel import select

from app.core.repository import BaseRepository
from app.modules.productos.model import Producto


class ProductoRepository(BaseRepository[Producto]):
    model = Producto

    def buscar(
        self,
        *,
        skip: int,
        limit: int,
        texto: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> tuple[list[Producto], int]:
        filtros = [Producto.activo == True]  # noqa: E712
        if texto:
            filtros.append(Producto.nombre.ilike(f"%{texto}%"))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        total = self.session.exec(
            select(func.count()).select_from(Producto).where(*filtros)
        ).one()
        items = self.session.exec(
            select(Producto).where(*filtros).offset(skip).limit(limit)
        ).all()
        return list(items), total