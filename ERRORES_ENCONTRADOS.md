# Errores que encontré

Aquí anoté qué error salió, cómo me di cuenta y qué cambié para corregirlo. Las líneas son las que tenía el archivo antes de corregirlo.

## Errores del proyecto

1. **`prisma/schema.prisma:20` — typo.** `prisma generate` dijo que `@uniqe` no era un atributo válido. Lo escribí como `@unique`.

2. **`prisma/schema.prisma:53` — typo.** Prisma no reconoció `PENDENTE` como valor del enum. Lo cambié por `PENDIENTE`.

3. **`prisma/schema.prisma:47` — terminal/ejecución.** Prisma avisó que a `DetallePedido.producto` le faltaba su campo relacionado en `Producto`. Agregué `detallePedidos DetallePedido[]`.

4. **`package.json:13` — typo.** Al iniciar, Nest dijo que `star` no era un comando. Cambié el script a `nest start --watch`.

5. **`src/categoria/dto/create-categoria.dto.ts:14` — sintaxis.** Faltaba una llave de cierre. Cerré la clase `CreateCategoriaDto`.

6. **`src/cliente/cliente.controller.ts:29` — sintaxis.** Faltaba cerrar el paréntesis de `@Get(':id')`. Los demás mensajes de esa zona salían como consecuencia de ese error.

7. **`src/pedido/dto/cambiar-estado.dto.ts:6` — sintaxis.** Faltaba una coma entre `enum` y `example` en `@ApiProperty`. La agregué.

8. **`src/app.module.ts:5` — terminal/ejecución.** El build buscaba `./clientes/`, pero la carpeta se llama `cliente`. Corregí la ruta al módulo.

9. **`src/app.module.ts:8` y `src/pedido/pedido.module.ts:9` — terminal/ejecución.** En un archivo se esperaba `PedidoModule` y en el otro se exportaba `PedidoModulo`. Dejé el nombre igual en ambos.

10. **`src/main.ts:2` — terminal/ejecución.** TypeScript indicó que `ValidationPipe` no viene de `@nestjs/core`. Lo importé desde `@nestjs/common`.

11. **`src/main.ts:22` — lógica.** La variable `PORT` llega como texto. La convertí a número antes de pasarla a `app.listen`.

12. **`src/prisma/prisma.service.ts:7` — sintaxis.** TypeScript indicó que faltaba llamar al constructor de la clase base. Agregué `super({ adapter })`.

13. **`src/cliente/dto/create-cliente.dto.ts:12` — typo.** El DTO decía `emial` en vez de `email`. Corregí el nombre del campo.

14. **`src/cliente/cliente.service.ts:16` — lógica.** Para buscar un correo repetido, el código usaba el nombre. Cambié la búsqueda para usar `data.email`.

15. **`src/cliente/cliente.service.ts:39` — lógica.** Al actualizar un cliente no se revisaba si el nuevo correo ya era de otra persona. Añadí esa comprobación y el error de conflicto (**409**).

16. **`src/categoria/categoria.service.ts:10` — terminal/ejecución.** Faltaba `@Injectable()`, que Nest necesita para poder inyectar `PrismaService`. Lo agregué.

17. **`src/categoria/categoria.service.ts:37` — lógica.** Al cambiar el nombre de una categoría no se revisaba si ya estaba usado. Añadí la comprobación para responder con **409**.

18. **`src/categoria/categoria.service.ts:47` — lógica.** La condición revisaba si había menos de cero productos, algo que no puede pasar en ese conteo. La cambié para impedir borrar la categoría cuando sí tiene productos.

19. **`src/producto/dto/create-producto.dto.ts:24` — lógica.** `@IsInt()` no acepta precios como `7.5`. Lo cambié por validación de número positivo con máximo dos decimales.

20. **`src/producto/producto.controller.ts:30` — lógica.** `categoriaId` es opcional, pero el pipe rechazaba la petición si no venía. Lo configuré para permitir que falte.

21. **`src/producto/producto.service.ts:24` — typo.** Prisma no reconocía `insensitiv`. Lo corregí a `insensitive` para buscar sin distinguir mayúsculas.

22. **`src/producto/producto.service.ts:33` — typo.** El campo se llama `categoria`, no `categorias`. Corregí el nombre usado en `include`.

23. **`src/pedido/pedido.controller.ts:29` — lógica.** La ruta usa `clienteId`, pero el código intentaba leer `id`. Cambié el nombre del parámetro que lee el controlador.

24. **`src/pedido/pedido.service.ts:86` — sintaxis.** Se usaba `await` en un método que no era asíncrono. Marqué `findOne` como `async`.

25. **`src/pedido/pedido.service.ts:38` — lógica.** La comparación estaba al revés y podía rechazar una compra aunque hubiera suficiente stock. Corregí la comparación y agrupé cantidades cuando el mismo producto aparece más de una vez.

26. **`src/pedido/pedido.service.ts:57` — lógica.** Al comprar, se descontaba siempre una unidad. Ahora se descuenta la cantidad solicitada, comprobando que alcance el stock.

27. **`src/pedido/utils/calculos.ts:12` — lógica.** El subtotal sumaba precio y cantidad. Debe multiplicarlos, así que cambié la operación a `precio * cantidad`.

28. **`src/pedido/utils/calculos.ts:17` — lógica.** El total sumaba precios unitarios en vez de subtotales. Cambié la suma para usar los subtotales.

29. **`src/pedido/pedido.service.ts:81` — lógica.** Los pedidos de un cliente salían del más antiguo al más nuevo. Cambié el orden para mostrar primero los recientes.

30. **`src/pedido/pedido.service.ts:106` — lógica.** El código asignaba `CANCELADO` dentro de una condición, en vez de comparar el estado. Lo cambié a una comparación estricta para devolver stock solo al cancelar.

31. **`src/pedido/dto/create-pedido.dto.ts:33` — lógica.** Los objetos de `items` no se convertían a `ItemPedidoDto`, así que no se validaban como objetos anidados. Agregué `@Type(() => ItemPedidoDto)`.

32. **`prisma/schema.prisma:42` — lógica.** Los importes estaban como `Float`, que puede dar pequeñas diferencias de precisión. Cambié esos campos a `Decimal` y apliqué una migración para guardar el cambio.

## Comprobaciones

- `npm install`: dependencias instaladas correctamente.
- `npx prisma generate`: terminó bien.
- `npx prisma migrate dev`: creó y aplicó la migración; la base de datos quedó sincronizada.
- `npm run build`: compiló sin errores.
- `npm run start:dev`: servidor corriendo en puerto 3000.
- `npm test`: Corriendo tests sin errores

## Estado de las pruebas en Swagger

- Pruebas Realizadas: Las pruebas de casos válidos realizadas en Swagger fueron exitosas.

- Pruebas Faltantes: El código incluye validaciones para casos de error como datos inválidos,
  recursos inexistentes, registros duplicados y falta de stock. Estos casos
  están implementados, pero aún están pendientes de probar directamente desde
  Swagger y registrar sus respuestas reales.
