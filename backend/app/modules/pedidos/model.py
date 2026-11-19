from datetime import datetime

from sqlmodel import Field, Relationship, SQLModel

from app.core.fechas import ahora


class Pedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    estado: str = Field(default="PENDIENTE", max_length=20)
    forma_pago: str = Field(max_length=20)
    direccion_entrega: str = Field(max_length=200)
    notas: str | None = Field(default=None)
    total: float = Field(default=0)
    created_at: datetime = Field(default_factory=ahora)
    updated_at: datetime = Field(
        default_factory=ahora, sa_column_kwargs={"onupdate": ahora}
    )

    usuario: "Usuario" = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int
    nombre_producto: str = Field(max_length=100)
    precio_unitario: float
    subtotal: float

    pedido: Pedido | None = Relationship(back_populates="items")
    producto: "Producto" = Relationship(back_populates="detalles")