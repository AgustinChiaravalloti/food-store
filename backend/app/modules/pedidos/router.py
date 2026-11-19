from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schema import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.model import Usuario

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService()


ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]
SesionDep = Annotated[Usuario, Depends(get_current_active_user)]
AdminDep = Annotated[Usuario, Depends(require_role(["admin"]))]


@router.post("", status_code=status.HTTP_201_CREATED, response_model=PedidoRead)
def crear(data: PedidoCreate, usuario: SesionDep, service: ServiceDep):
    try:
        return service.crear(usuario.id, data)
    except ProductoNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Producto inexistente o inactivo")
    except ProductoNoDisponible:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Producto no disponible")
    except StockInsuficiente:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Stock insuficiente")
    except ProductoRepetido:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Producto repetido en el pedido")


@router.get("", response_model=PedidosPaginados)
def listar(
    usuario: SesionDep,
    service: ServiceDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=0, le=100),
    estado: str | None = None,
):
    return service.listar(usuario=usuario, skip=skip, limit=limit, estado=estado)


@router.get("/resumen", response_model=ResumenPedidos)
def resumen(_: AdminDep, service: ServiceDep):
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def detalle(pedido_id: int, usuario: SesionDep, service: ServiceDep):
    try:
        return service.obtener(pedido_id, usuario)
    except PedidoNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pedido inexistente")
    except PedidoAjeno:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "El pedido pertenece a otro usuario")


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(pedido_id: int, data: CambioEstado, _: AdminDep, service: ServiceDep):
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except PedidoNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pedido inexistente")
    except TransicionInvalida:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Transición de estado inválida")


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar(pedido_id: int, usuario: SesionDep, service: ServiceDep):
    try:
        return service.cancelar(pedido_id, usuario)
    except PedidoNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pedido inexistente")
    except PedidoAjeno:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "El pedido pertenece a otro usuario")
    except TransicionInvalida:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Solo se puede cancelar en PENDIENTE")