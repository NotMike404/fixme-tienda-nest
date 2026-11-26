import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { aNumero, serializarPedido } from '../prisma/response-serializers.js';
import { EstadoPedido } from '../generated/prisma/enums.js';
import { CreatePedidoDto } from './dto/create-pedido.dto.js';
import {
  LineaPedido,
  calcularSubtotal,
  calcularTotal,
  puedeCambiarEstado,
} from './utils/calculos.js';

@Injectable()
export class PedidoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePedidoDto) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: data.clienteId },
    });
    if (!cliente || !cliente.activo) {
      throw new NotFoundException(`El cliente ${data.clienteId} no existe`);
    }

    const lineas: LineaPedido[] = [];
    const productos = new Map<
      number,
      { nombre: string; stock: number }
    >();
    const cantidadesPorProducto = new Map<number, number>();
    for (const item of data.items) {
      const producto = await this.prisma.producto.findUnique({
        where: { id: item.productoId },
      });
      if (!producto) {
        throw new NotFoundException(
          `El producto ${item.productoId} no existe`,
        );
      }
      productos.set(producto.id, {
        nombre: producto.nombre,
        stock: producto.stock,
      });
      cantidadesPorProducto.set(
        producto.id,
        (cantidadesPorProducto.get(producto.id) ?? 0) + item.cantidad,
      );
      lineas.push({
        productoId: producto.id,
        cantidad: item.cantidad,
        precioUnitario: aNumero(producto.precio),
        subtotal: calcularSubtotal(aNumero(producto.precio), item.cantidad),
      });
    }

    for (const [productoId, cantidad] of cantidadesPorProducto) {
      const producto = productos.get(productoId)!;
      if (producto.stock < cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para ${producto.nombre}`,
        );
      }
    }

    const total = calcularTotal(lineas);

    return this.prisma.$transaction(async (tx) => {
      for (const [productoId, cantidad] of cantidadesPorProducto) {
        const resultado = await tx.producto.updateMany({
          where: { id: productoId, stock: { gte: cantidad } },
          data: { stock: { decrement: cantidad } },
        });
        if (resultado.count === 0) {
          throw new BadRequestException(
            `Stock insuficiente para ${productos.get(productoId)!.nombre}`,
          );
        }
      }
      const pedido = await tx.pedido.create({
        data: {
          clienteId: data.clienteId,
          total,
          detalles: { create: lineas },
        },
        include: { detalles: true },
      });
      return serializarPedido(pedido);
    });
  }

  async findAll() {
    const pedidos = await this.prisma.pedido.findMany({
      orderBy: { createdAt: 'desc' },
      include: { cliente: true },
    });
    return pedidos.map(serializarPedido);
  }

  async findByCliente(clienteId: number) {
    const pedidos = await this.prisma.pedido.findMany({
      where: { clienteId },
      orderBy: { createdAt: 'desc' },
      include: { detalles: true },
    });
    return pedidos.map(serializarPedido);
  }

  async findOne(id: number) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: { cliente: true, detalles: { include: { producto: true } } },
    });
    if (!pedido) {
      throw new NotFoundException(`El pedido ${id} no existe`);
    }
    return serializarPedido(pedido);
  }

  async cambiarEstado(id: number, nuevo: EstadoPedido) {
    const pedido = await this.findOne(id);
    if (!puedeCambiarEstado(pedido.estado, nuevo)) {
      throw new BadRequestException(
        `No se puede pasar de ${pedido.estado} a ${nuevo}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      if (nuevo === EstadoPedido.CANCELADO) {
        for (const detalle of pedido.detalles) {
          await tx.producto.update({
            where: { id: detalle.productoId },
            data: { stock: { increment: detalle.cantidad } },
          });
        }
      }
      const actualizado = await tx.pedido.update({
        where: { id },
        data: { estado: nuevo },
      });
      return serializarPedido(actualizado);
    });
  }
}
