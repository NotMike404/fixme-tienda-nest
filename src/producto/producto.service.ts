import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { serializarProducto } from '../prisma/response-serializers.js';
import { CreateProductoDto } from './dto/create-producto.dto.js';
import { UpdateProductoDto } from './dto/update-producto.dto.js';

@Injectable()
export class ProductoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProductoDto) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id: data.categoriaId },
    });
    if (!categoria) {
      throw new NotFoundException(`La categoría ${data.categoriaId} no existe`);
    }
    return serializarProducto(await this.prisma.producto.create({ data }));
  }

  async findAll(categoriaId?: number, buscar?: string) {
    const productos = await this.prisma.producto.findMany({
      where: {
        categoriaId,
        nombre: buscar ? { contains: buscar, mode: 'insensitive' } : undefined,
      },
      orderBy: { nombre: 'asc' },
    });
    return productos.map(serializarProducto);
  }

  async findOne(id: number) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: { categoria: true },
    });
    if (!producto) {
      throw new NotFoundException(`El producto ${id} no existe`);
    }
    return serializarProducto(producto);
  }

  async update(id: number, data: UpdateProductoDto) {
    await this.findOne(id);
    if (data.categoriaId !== undefined) {
      const categoria = await this.prisma.categoria.findUnique({
        where: { id: data.categoriaId },
      });
      if (!categoria) {
        throw new NotFoundException(
          `La categoría ${data.categoriaId} no existe`,
        );
      }
    }
    return serializarProducto(
      await this.prisma.producto.update({ where: { id }, data }),
    );
  }

  async remove(id: number) {
    await this.findOne(id);
    return serializarProducto(
      await this.prisma.producto.delete({ where: { id } }),
    );
  }
}
