/*
  Warnings:

  - You are about to alter the column `precioUnitario` on the `detalles_pedido` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `subtotal` on the `detalles_pedido` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `total` on the `pedidos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `precio` on the `productos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "detalles_pedido" ALTER COLUMN "precioUnitario" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "pedidos" ALTER COLUMN "total" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "productos" ALTER COLUMN "precio" SET DATA TYPE DECIMAL(65,30);
