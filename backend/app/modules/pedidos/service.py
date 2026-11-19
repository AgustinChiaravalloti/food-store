from app.core.fechas import ahora
from app.modules.pedidos.model import DetallePedido, Pedido
from app.modules.pedidos.schema import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.model import Usuario

# Máquina de estados (RN-02): estados terminales no tienen transiciones
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class TransicionInvalida(Exception):
    pass


class PedidoService:
    def __init__(self) -> None:
        self.uow = PedidoUnitOfWork()

    @staticmethod
    def _obtener(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado()
        return pedido

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        for detalle in pedido.items:
            producto = uow.productos.get_by_id(detalle.producto_id)
            if producto is not None:
                producto.stock += detalle.cantidad

    def crear(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        ids = [item.producto_id for item in data.items]
        if len(ids) != len(set(ids)):
            raise ProductoRepetido()

        with self.uow as uow:
            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                    total=0,
                )
            )
            total = 0.0
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado()
                if not producto.disponible:
                    raise ProductoNoDisponible()
                if producto.stock < item.cantidad:
                    raise StockInsuficiente()

                producto.stock -= item.cantidad
                subtotal = producto.precio_base * item.cantidad
                pedido.items.append(
                    DetallePedido(
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = total
            return PedidoRead.model_validate(pedido)

    def listar(
        self,
        *,
        usuario: Usuario,
        skip: int,
        limit: int,
        estado: str | None,
    ) -> PedidosPaginados:
        usuario_id = None if usuario.role == "admin" else usuario.id
        with self.uow as uow:
            items, total = uow.pedidos.buscar(
                skip=skip, limit=limit, usuario_id=usuario_id, estado=estado
            )
            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(p) for p in items],
            )

    def obtener(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida()
            self._restituir_stock(uow, pedido)
            pedido.estado = "CANCELADO"
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if nuevo_estado not in TRANSICIONES[pedido.estado]:
                raise TransicionInvalida()
            if nuevo_estado == "CANCELADO":
                self._restituir_stock(uow, pedido)
            pedido.estado = nuevo_estado
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        inicio_del_dia = ahora().replace(hour=0, minute=0, second=0, microsecond=0)
        with self.uow as uow:
            return ResumenPedidos(
                pendientes=uow.pedidos.contar_por_estado("PENDIENTE"),
                en_preparacion=uow.pedidos.contar_por_estado("EN_PREPARACION"),
                entregados=uow.pedidos.contar_por_estado("ENTREGADO"),
                cancelados=uow.pedidos.contar_por_estado("CANCELADO"),
                pedidos_hoy=uow.pedidos.contar_desde(inicio_del_dia),
                ingresos_entregados=uow.pedidos.sumar_total_por_estado("ENTREGADO"),
            )