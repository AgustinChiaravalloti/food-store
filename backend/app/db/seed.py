from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hashear_password
from app.modules.categorias.model import Categoria
from app.modules.pedidos.model import DetallePedido, Pedido  # noqa: F401
from app.modules.productos.model import Producto
from app.modules.usuarios.model import Usuario

ADMIN = {
    "username": "admin",
    "full_name": "Administrador",
    "email": "admin@foodstore.com",
    "password": "Admin1234!",
}

CATEGORIAS = [
    ("Hamburguesas", "Burgers de carne y vegetales"),
    ("Pizzas", "Pizzas al horno de leña"),
    ("Bebidas", "Gaseosas, aguas y jugos"),
]

# (categoría, nombre, precio_base, stock)
PRODUCTOS = [
    ("Hamburguesas", "Clásica", 4500.0, 20),
    ("Hamburguesas", "Doble queso", 6200.0, 15),
    ("Hamburguesas", "Vegana", 5300.0, 10),
    ("Pizzas", "Muzzarella", 7000.0, 12),
    ("Pizzas", "Napolitana", 7800.0, 8),
    ("Bebidas", "Gaseosa 500ml", 1500.0, 40),
    ("Bebidas", "Agua mineral", 1000.0, 50),
    ("Bebidas", "Jugo natural", 2200.0, 25),
]


def seed() -> None:
    create_all_tables()
    with Session(engine) as session:
        existe_admin = session.exec(
            select(Usuario).where(Usuario.username == ADMIN["username"])
        ).first()
        if existe_admin is None:
            session.add(
                Usuario(
                    username=ADMIN["username"],
                    full_name=ADMIN["full_name"],
                    email=ADMIN["email"],
                    hashed_password=hashear_password(ADMIN["password"]),
                    role="admin",
                )
            )

        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = session.exec(
                select(Categoria).where(Categoria.nombre == nombre)
            ).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(categoria)
                session.flush()
            categorias[nombre] = categoria

        for categoria_nombre, nombre, precio, stock in PRODUCTOS:
            existe = session.exec(
                select(Producto).where(Producto.nombre == nombre)
            ).first()
            if existe is None:
                session.add(
                    Producto(
                        categoria_id=categorias[categoria_nombre].id,
                        nombre=nombre,
                        precio_base=precio,
                        stock=stock,
                    )
                )

        session.commit()
    print("Seed cargado. Usuario admin: admin / Admin1234!")


if __name__ == "__main__":
    seed()