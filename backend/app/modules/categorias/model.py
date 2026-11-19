from datetime import datetime

from sqlmodel import Field, Relationship, SQLModel

from app.core.fechas import ahora


class Categoria(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100, unique=True)
    descripcion: str | None = Field(default=None)
    activo: bool = Field(default=True)

    productos: list["Producto"] = Relationship(back_populates="categoria")

