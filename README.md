# 📦 Sistema de Inventario con Escaneo QR/Código de Barras

Una aplicación web progresiva (PWA) completa para gestión de inventario mediante escaneo de códigos QR y códigos de barras. Permite registrar productos nuevos al escanear, actualizar stock automáticamente, y realizar ventas restando unidades del inventario en tiempo real.

## ✨ Características Principales

- 📱 **Escaneo QR/Códigos de Barras**: Usa la cámara del dispositivo para leer múltiples formatos
- 🏪 **Gestión de Inventario**: Registro automático de productos y control de stock
- 💰 **Punto de Venta**: Procesamiento de ventas con cálculos automáticos de IVA
- 📊 **Dashboard en Tiempo Real**: Métricas de inventario, ventas y alertas de stock bajo
- 📈 **Sistema de Reportes**: Reportes de 24h, 7 días, mensual y completo con impresión
- 🏷️ **Gestión de Categorías**: Organización de productos por categorías
- 🏢 **Gestión de Proveedores**: Control de proveedores y relaciones
- ➕ **Agregar Stock**: Funcionalidad para incrementar stock con historial
- 🗑️ **Eliminación Segura**: Borrado de productos, categorías y proveedores
- 🧭 **Navegación Avanzada**: Navbar completo con breadcrumbs
- 📱 **PWA**: Instalable en dispositivos móviles con funcionalidad offline
- 🔄 **Historial Completo**: Seguimiento de todos los movimientos de inventario

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15** con App Router
- **React 18** con TypeScript
- **Tailwind CSS** para estilos
- **shadcn/ui** para componentes UI
- **html5-qrcode** para escaneo de códigos

### Backend
- **Next.js API Routes** (serverless)
- **Prisma ORM** con PostgreSQL
- **Zod** para validación de datos
- **React Hook Form** para formularios

### Herramientas
- **Vercel** para deployment
- **ESLint** y **Prettier** para código limpio

## 🚀 Inicio Rápido

### 1. Clonar e Instalar

```bash
cd inventory-app
npm install
```

### 2. Configurar Base de Datos

Consulta `DATABASE_SETUP.md` para instrucciones detalladas. Opciones disponibles:
- PostgreSQL local
- Vercel Postgres (recomendado)
- Docker PostgreSQL

### 3. Variables de Entorno

Crea `.env.local`:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/inventory_db"
NEXT_PUBLIC_APP_NAME="Sistema de Inventario"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4. Ejecutar Migraciones

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Iniciar Desarrollo

```bash
npm run dev
```

Visita [http://localhost:3000](http://localhost:3000)

## 📱 Funcionalidades

### Dashboard
- Métricas en tiempo real
- Alertas de stock bajo
- Resumen de ventas del día
- Valor total del inventario

### Gestión de Inventario
- Escaneo para agregar productos nuevos
- Actualización automática de stock
- Búsqueda manual de productos
- Control de stock mínimo

### Punto de Venta
- Escaneo rápido para ventas
- Cálculo automático de IVA
- Validación de stock disponible
- Historial de transacciones

### Reportes
- Movimientos de inventario
- Historial de ventas
- Filtros por fecha y tipo

## 🏗️ Estructura del Proyecto

```
inventory-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── inventory/          # Gestión de inventario
│   │   ├── sales/              # Punto de venta
│   │   └── api/                # API Routes
│   ├── components/             # Componentes React
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── scanner/            # Componentes de escaneo
│   │   ├── forms/              # Formularios
│   │   └── dashboard/          # Componentes del dashboard
│   └── lib/                    # Utilidades y configuración
├── prisma/                     # Esquema de base de datos
└── public/                     # Archivos estáticos
```

## 🗄️ Esquema de Base de Datos

### Modelos Principales

- **Product**: Información del producto (código, precios, stock)
- **StockMovement**: Historial de movimientos de inventario
- **Sale**: Registro de ventas realizadas

### Relaciones
- Product → StockMovement (1:N)
- Product → Sale (1:N)

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # Linter
npm run type-check   # Verificación de tipos
```

## 📱 PWA (Progressive Web App)

La aplicación es instalable como PWA:
- Funciona offline (básico)
- Acceso a cámara para escaneo
- Instalable en dispositivos móviles
- Notificaciones push (futuro)

## 🔒 Seguridad

- Validación con Zod en frontend y backend
- Transacciones atómicas con Prisma
- Sanitización automática de inputs
- Headers de seguridad configurados
- Variables sensibles en `.env.local`

## 🚀 Deployment

### Vercel (Recomendado)

1. **Conecta el repositorio:**
   - Ve a [vercel.com](https://vercel.com)
   - Importa el repositorio: `https://github.com/makebyjordan/qr1.git`

2. **Configura las variables de entorno:**
   ```
   DATABASE_URL=postgresql://usuario:password@host:5432/database
   NEXT_PUBLIC_APP_NAME=Sistema de Inventario
   NEXT_PUBLIC_BASE_URL=https://tu-dominio.vercel.app
   ```

3. **Deploy automático:**
   - Cada push a `main` despliega automáticamente
   - URL del proyecto: https://github.com/makebyjordan/qr1

### Manual

```bash
npm run build
npm run start
```

### Base de Datos en Producción

Para producción, recomendamos usar **Vercel Postgres**:
1. En tu proyecto de Vercel, ve a Storage
2. Crea una nueva base de datos Postgres
3. Copia la `DATABASE_URL` a las variables de entorno
4. Ejecuta las migraciones: `npx prisma migrate deploy`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🆘 Soporte

Si encuentras algún problema:
1. Revisa `DATABASE_SETUP.md`
2. Verifica las variables de entorno
3. Consulta los logs del servidor
4. Abre un issue en GitHub

---

**¡Listo para gestionar tu inventario de manera inteligente! 📦✨**
