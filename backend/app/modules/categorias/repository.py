from sqlmodel import select

from app.core.repository import BaseRepository
from app.modules.categorias.model import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    model = Categoria

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        return self.session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()

    def get_activas(self) -> list[Categoria]:
        return list(self.session.exec(select(Categoria).where(Categoria.activo == True)).all())  # noqa: E712