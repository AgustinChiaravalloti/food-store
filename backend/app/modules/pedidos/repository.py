from datetime import datetime

from sqlalchemy import func
from sqlmodel import select

from app.core.repository import BaseRepository
from app.modules.pedidos.model import Pedido


def _filtrar(stmt, filtros):
    for filtro in filtros:
        stmt = stmt.where(filtro)
    return stmt


class PedidoRepository(BaseRepository[Pedido]):
    model = Pedido

    def buscar(
        self,
        *,
        skip: int,
        limit: int,
        usuario_id: int | None,
        estado: str | None,
    ) -> tuple[list[Pedido], int]:
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filtros.append(Pedido.estado == estado)

        total = self.session.exec(
            _filtrar(select(func.count()).select_from(Pedido), filtros)
        ).one()
        items = self.session.exec(
            _filtrar(select(Pedido), filtros)
            .order_by(Pedido.id.desc())
            .offset(skip)
            .limit(limit)
        ).all()
        return list(items), total

    def contar_por_estado(self, estado: str) -> int:
        return self.session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.estado == estado)
        ).one()

    def contar_desde(self, desde: datetime) -> int:
        return self.session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        ).one()

    def sumar_total_por_estado(self, estado: str) -> float:
        resultado = self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado)
        ).one()
        return float(resultado)