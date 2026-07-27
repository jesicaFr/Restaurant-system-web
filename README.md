# Restaurant System Web

Frontend de un sistema de gestión para restaurantes. Permite administrar mesas,
productos, stock, pedidos y consultar el resumen diario de caja.

La aplicación fue desarrollada con Angular y consume una API REST creada con
ASP.NET Core.

## Funcionalidades

- Panel con estadísticas generales.
- Alta, edición, búsqueda y eliminación de mesas.
- Gestión de productos, precios, disponibilidad y stock.
- Creación de pedidos con validación de existencias.
- Actualización del estado de los pedidos.
- Control de disponibilidad de mesas.
- Resumen de ventas por fecha y medio de pago.
- Diseño responsive para computadoras, tablets y dispositivos móviles.
- Manejo de errores y validaciones de formularios.

## Tecnologías

- Angular 22
- TypeScript
- Angular Material
- RxJS
- HTML y CSS
- Vitest

## Requisitos

- Node.js compatible con Angular 22
- npm 11 o superior
- Restaurant Management API ejecutándose localmente

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/jesicaFr/Restaurant-system-web.git
cd Restaurant-system-web
```

Instalar las dependencias:

```bash
npm install
```

Iniciar el servidor de desarrollo:

```bash
npm start
```

Abrir la aplicación en:

```text
http://localhost:4200
```

## Configuración de la API

Durante el desarrollo, el frontend se conecta a:

```text
http://localhost:5000/api
```

La URL se encuentra en:

```text
src/environments/environment.ts
```

La configuración de producción está en:

```text
src/environments/environment.production.ts
```

En producción se utiliza `/api`, pensado para servir el frontend y la API bajo
el mismo dominio o detrás de un proxy inverso. Si ambos proyectos se publican
en dominios diferentes, se debe reemplazar ese valor por la URL pública de la
API antes de generar el build.

## Comandos disponibles

Iniciar el proyecto:

```bash
npm start
```

Verificar TypeScript y las plantillas de Angular:

```bash
npm run typecheck
```

Ejecutar los tests:

```bash
npm run test:ci
```

Generar el build de producción:

```bash
npm run build
```

Los archivos generados se guardan en:

```text
dist/restaurant-system-web/browser
```

## Estructura principal

```text
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   └── services/
│   ├── pages/
│   │   ├── cash-register/
│   │   ├── dashboard/
│   │   ├── menu-items/
│   │   ├── orders/
│   │   └── tables/
│   └── shared/
│       └── components/
├── environments/
└── styles.css
```

## Validaciones realizadas

- Compilación de producción sin errores.
- Verificación estricta de TypeScript y plantillas.
- Tests automatizados con Vitest.
- Formato consistente con Prettier.
- Auditoría de dependencias npm sin vulnerabilidades conocidas.

## Autora

[Jesica Fr](https://github.com/jesicaFr)
