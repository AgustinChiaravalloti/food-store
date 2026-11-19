# Food Store

Sistema de pedidos de comida para la materia Programación 4 (UTN). Incluye una API REST con FastAPI y una aplicación web con React.

- **Cliente**: navega el catálogo, arma un carrito, confirma pedidos y puede cancelar los que todavía están pendientes.
- **Administrador**: gestiona pedidos (cambio de estado), productos (stock y disponibilidad), categorías y usuarios, y consulta un resumen del día.

## Video de demostración

[LINK DEL VIDEO]

## Repositorio

https://github.com/AgustinChiaravalloti/food-store

## Requisitos

- Python 3.13
- Node.js 20 o superior
- pnpm 9 o superior

La base de datos es SQLite, así que no hace falta instalar PostgreSQL ni Docker.

## Estructura del proyecto

```
food-store/
├── backend/     API REST con FastAPI, SQLModel y JWT
├── frontend/    Aplicación React + TypeScript
└── README.md
```

## Backend

Desde la carpeta `backend`:

```powershell
# 1. Crear y activar el entorno virtual
python -m venv .venv
.venv\Scripts\activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Crear el archivo de variables de entorno
Copy-Item .env.example .env
# Editá .env y reemplazá SECRET_KEY por una clave de al menos 32 caracteres

# 4. Cargar los datos iniciales (categorías, productos y usuario admin)
python -m app.db.seed

# 5. Levantar el servidor
uvicorn app.main:app --reload
```

La API queda disponible en `http://localhost:8000`. La documentación interactiva está en `http://localhost:8000/docs`.

El comando de seed es idempotente: si lo ejecutás de nuevo, no duplica los datos.

### Variables de entorno del backend

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | URL de la base de datos | `sqlite:///./foodstore.db` |
| `SECRET_KEY` | Clave para firmar los JWT (mínimo 32 caracteres) | `cambiar-por-una-clave-larga-y-segura` |
| `ALGORITHM` | Algoritmo de firma del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión en minutos | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |

## Frontend

Desde la carpeta `frontend`, con el backend ya levantado:

```powershell
# 1. Instalar dependencias
pnpm install

# 2. Crear el archivo de variables de entorno
Copy-Item .env.example .env

# 3. Levantar la aplicación en modo desarrollo
pnpm dev
```

La aplicación queda disponible en `http://localhost:5173`.

Para generar la versión de producción:

```powershell
pnpm build
```

### Variables de entorno del frontend

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

## Usuario administrador

El seed crea un usuario administrador con estos datos:

- **Usuario**: `admin`
- **Contraseña**: `Admin1234!`

Para ingresar como administrador, usá la pantalla de login con esas credenciales. Desde el panel se accede a Resumen, Pedidos, Productos, Categorías y Usuarios.

Los clientes se pueden registrar desde la pantalla de registro.

## Reglas de negocio principales

- Un pedido descuenta stock de forma transaccional. Si algún producto no alcanza, el pedido no se crea.
- Los pedidos siguen una máquina de estados: PENDIENTE → EN_PREPARACION → ENTREGADO, o cancelación. ENTREGADO y CANCELADO son estados finales.
- Al cancelar un pedido, el stock de sus productos se restituye en la misma transacción.
- Un cliente solo puede cancelar sus propios pedidos en estado PENDIENTE.
- Las categorías y los productos se dan de baja de forma lógica, sin borrado físico.