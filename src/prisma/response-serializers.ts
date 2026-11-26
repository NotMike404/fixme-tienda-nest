type DecimalLike = number | { toNumber(): number };

export function aNumero(value: DecimalLike): number {
  return typeof value === 'number' ? value : value.toNumber();
}

export function serializarProducto<T extends { precio: DecimalLike }>(
  producto: T,
) {
  return { ...producto, precio: aNumero(producto.precio) };
}

type DetalleConImportes = {
  precioUnitario: DecimalLike;
  subtotal: DecimalLike;
  producto?: { precio: DecimalLike } | null;
};

export function serializarPedido<
  T extends { total: DecimalLike; detalles?: DetalleConImportes[] },
>(pedido: T) {
  return {
    ...pedido,
    total: aNumero(pedido.total),
    ...(pedido.detalles
      ? {
          detalles: pedido.detalles.map((detalle) => ({
            ...detalle,
            precioUnitario: aNumero(detalle.precioUnitario),
            subtotal: aNumero(detalle.subtotal),
            ...(detalle.producto
              ? { producto: serializarProducto(detalle.producto) }
              : {}),
          })),
        }
      : {}),
  };
}
