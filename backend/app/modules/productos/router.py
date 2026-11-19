from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schema import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.usuarios.model import Usuario

router = APIRouter(prefix="/productos", tags=["productos"])


def get_producto_service() -> ProductoService:
    return ProductoService()


ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]
AdminDep = Annotated[Usuario, Depends(require_role(["admin"]))]


@router.get("", response_model=ProductosPaginados)
def listar(
    service: ServiceDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=0, le=100),
    search: str | None = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
):
    return service.listar(
        skip=skip,
        limit=limit,
        texto=search,
        categoria_id=categoria_id,
        disponible=disponible,
    )


@router.get("/{producto_id}", response_model=ProductoRead)
def detalle(producto_id: int, service: ServiceDep):
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Producto inexistente")


@router.post("", status_code=status.HTTP_201_CREATED, response_model=ProductoRead)
def crear(data: ProductoCreate, _: AdminDep, service: ServiceDep):
    try:
        return service.crear(data)
    except CategoriaNoEncontrada:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "La categoría no existe o está dada de baja")


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar(producto_id: int, data: ProductoUpdate, _: AdminDep, service: ServiceDep):
    try:
        return service.actualizar(producto_id, data)
    except ProductoNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Producto inexistente")
    except CategoriaNoEncontrada:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "La categoría no existe o está dada de baja")


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: int, data: ProductoStockUpdate, _: AdminDep, service: ServiceDep
):
    try:
        return service.actualizar_stock(producto_id, data)
    except ProductoNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Producto inexistente")


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def dar_de_baja(producto_id: int, _: AdminDep, service: ServiceDep):
    try:
        service.dar_de_baja(producto_id)
    except ProductoNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Producto inexistente")
    return Response(status_code=status.HTTP_204_NO_CONTENT)