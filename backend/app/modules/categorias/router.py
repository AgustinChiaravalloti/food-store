from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import require_role
from app.modules.categorias.schema import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.usuarios.model import Usuario

router = APIRouter(prefix="/categorias", tags=["categorias"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService()


ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]
AdminDep = Annotated[Usuario, Depends(require_role(["admin"]))]


@router.get("", response_model=list[CategoriaRead])
def listar(service: ServiceDep):
    return service.listar_activas()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def detalle(categoria_id: int, service: ServiceDep):
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Categoría inexistente")


@router.post("", status_code=status.HTTP_201_CREATED, response_model=CategoriaRead)
def crear(data: CategoriaCreate, _: AdminDep, service: ServiceDep):
    try:
        return service.crear(data)
    except NombreDuplicado:
        raise HTTPException(status.HTTP_409_CONFLICT, "Ya existe una categoría con ese nombre")


@router.put("/{categoria_id}", response_model=CategoriaRead)
def actualizar(categoria_id: int, data: CategoriaUpdate, _: AdminDep, service: ServiceDep):
    try:
        return service.actualizar(categoria_id, data)
    except CategoriaNoEncontrada:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Categoría inexistente")
    except NombreDuplicado:
        raise HTTPException(status.HTTP_409_CONFLICT, "Ya existe una categoría con ese nombre")


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def dar_de_baja(categoria_id: int, _: AdminDep, service: ServiceDep):
    try:
        service.dar_de_baja(categoria_id)
    except CategoriaNoEncontrada:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Categoría inexistente")
    return Response(status_code=status.HTTP_204_NO_CONTENT)