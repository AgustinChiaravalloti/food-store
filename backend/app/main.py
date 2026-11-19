from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import FRONTEND_ORIGIN
from app.core.database import create_all_tables

# Importar todos los modelos para que SQLModel conozca las tablas y las relaciones
from app.modules.categorias.model import Categoria  # noqa: F401
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.model import DetallePedido, Pedido  # noqa: F401
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.model import Producto  # noqa: F401
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.model import Usuario  # noqa: F401
from app.modules.usuarios.router import admin_router, router as auth_router

API_PREFIX = "/api/v1"


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    create_all_tables()
    yield


app = FastAPI(title="Food Store API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(admin_router, prefix=API_PREFIX)
app.include_router(categorias_router, prefix=API_PREFIX)
app.include_router(productos_router, prefix=API_PREFIX)
app.include_router(pedidos_router, prefix=API_PREFIX)