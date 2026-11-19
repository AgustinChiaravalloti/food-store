from app.modules.categorias.model import Categoria
from app.modules.categorias.schema import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self) -> None:
        self.uow = CategoriaUnitOfWork()

    def _activa(self, uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada()
        return categoria

    def listar_activas(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.get_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._activa(uow, categoria_id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(data.nombre):
                raise NombreDuplicado()
            categoria = uow.categorias.add(Categoria(**data.model_dump()))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        cambios = data.model_dump(exclude_unset=True)
        if cambios.get("nombre") is None:
            cambios.pop("nombre", None)
        with self.uow as uow:
            categoria = self._activa(uow, categoria_id)
            if "nombre" in cambios:
                otra = uow.categorias.get_by_nombre(cambios["nombre"])
                if otra is not None and otra.id != categoria_id:
                    raise NombreDuplicado()
            for campo, valor in cambios.items():
                setattr(categoria, campo, valor)
            return CategoriaRead.model_validate(categoria)

    def dar_de_baja(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = self._activa(uow, categoria_id)
            categoria.activo = False
            for producto in categoria.productos:
                producto.activo = False