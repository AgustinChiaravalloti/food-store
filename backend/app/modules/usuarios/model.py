from datetime import datetime

from sqlmodel import Field, SQLModel, Relationship

from app.core.fechas import ahora


class Usuario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(max_length=50, unique=True)
    full_name: str = Field(max_length=100)
    email: str = Field(max_length=254, unique=True)
    hashed_password: str = Field(max_length=60)
    role: str = Field(default="user")
    disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=ahora)
    pedidos: list["Pedido"] = Relationship(back_populates="usuario")

