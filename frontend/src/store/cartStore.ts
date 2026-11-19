import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ItemCarrito {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
}

interface CartState {
  items: ItemCarrito[];
  agregar: (producto: Omit<ItemCarrito, "cantidad">) => void;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  vaciar: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      agregar: (producto) =>
        set((state) => {
          const existe = state.items.some((i) => i.producto_id === producto.producto_id);
          if (existe) {
            return {
              items: state.items.map((i) =>
                i.producto_id === producto.producto_id ? { ...i, cantidad: i.cantidad + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...producto, cantidad: 1 }] };
        }),
      quitar: (productoId) =>
        set((state) => ({ items: state.items.filter((i) => i.producto_id !== productoId) })),
      cambiarCantidad: (productoId, cantidad) =>
        set((state) => ({
          items: state.items.map((i) => (i.producto_id === productoId ? { ...i, cantidad } : i)),
        })),
      vaciar: () => set({ items: [] }),
    }),
    { name: "cart-storage" }
  )
);

export const selectTotal = (state: CartState) =>
  state.items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0);