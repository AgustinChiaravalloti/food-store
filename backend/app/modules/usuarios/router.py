from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from app.core.deps import get_current_active_user, require_role
from app.core.security import crear_access_token
from app.modules.usuarios.model import Usuario
from app.modules.usuarios.schema import UserCreate, UserPublic
from app.modules.usuarios.service import (
    AutoDesactivacion,
    CredencialesInvalidas,
    CuentaDesactivada,
    UsuarioDuplicado,
    UsuarioNoEncontrado,
    UsuarioService,
)

router = APIRouter(prefix="/auth", tags=["auth"])
admin_router = APIRouter(prefix="/admin/usuarios", tags=["admin: usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService()


ServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]
SesionDep = Annotated[Usuario, Depends(get_current_active_user)]
AdminDep = Annotated[Usuario, Depends(require_role(["admin"]))]


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserPublic)
def registrar(data: UserCreate, service: ServiceDep):
    try:
        return service.registrar(data)
    except UsuarioDuplicado:
        raise HTTPException(status.HTTP_409_CONFLICT, "El username o el email ya existen")


@router.post("/token")
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    response: Response,
    service: ServiceDep,
):
    try:
        usuario = service.autenticar(form.username, form.password)
    except UsuarioNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario inexistente")
    except CredencialesInvalidas:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Credenciales incorrectas")
    except CuentaDesactivada:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cuenta de usuario desactivada")

    token = crear_access_token(usuario.id)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return {"message": "Login exitoso"}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", httponly=True, samesite="lax")
    return {"message": "Logout exitoso"}


@router.get("/me", response_model=UserPublic)
def perfil(usuario: SesionDep):
    return UserPublic.model_validate(usuario)


@admin_router.get("", response_model=list[UserPublic])
def listar_usuarios(_: AdminDep, service: ServiceDep):
    return service.listar()


@admin_router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar(usuario_id: int, admin: AdminDep, service: ServiceDep):
    try:
        return service.cambiar_estado(usuario_id, disabled=False, actor_id=admin.id)
    except UsuarioNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario inexistente")


@admin_router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar(usuario_id: int, admin: AdminDep, service: ServiceDep):
    try:
        return service.cambiar_estado(usuario_id, disabled=True, actor_id=admin.id)
    except UsuarioNoEncontrado:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario inexistente")
    except AutoDesactivacion:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No puede desactivarse a sí mismo")