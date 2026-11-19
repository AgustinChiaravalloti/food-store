from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status

from app.core.security import decodificar_access_token
from app.modules.usuarios.model import Usuario
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def get_current_user(
    access_token: Annotated[str | None, Cookie()] = None,
) -> Usuario:
    if access_token is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "No autenticado")

    usuario_id = decodificar_access_token(access_token)
    if usuario_id is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token inválido o expirado")

    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_id(usuario_id)

    if usuario is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Usuario inexistente")
    return usuario


def get_current_active_user(
    usuario: Annotated[Usuario, Depends(get_current_user)],
) -> Usuario:
    if usuario.disabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cuenta de usuario desactivada")
    return usuario


def require_role(roles: list[str]):
    def verificar(
        usuario: Annotated[Usuario, Depends(get_current_active_user)],
    ) -> Usuario:
        if usuario.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Permiso insuficiente")
        return usuario

    return verificar