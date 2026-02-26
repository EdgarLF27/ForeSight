# TicketClass Backend

Backend API para el sistema de gestión de tickets TicketClass, construido con NestJS, Prisma ORM y PostgreSQL (Supabase).

## 🛠️ Tecnologías

- **Framework:** [NestJS](https://nestjs.com/) - Framework Node.js progresivo
- **Lenguaje:** TypeScript
- **ORM:** [Prisma](https://prisma.io/) - ORM moderno para Node.js
- **Base de datos:** PostgreSQL (alojado en Supabase)
- **Autenticación:** JWT (JSON Web Tokens)
- **Validación:** class-validator + class-transformer

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── auth/           # Autenticación y autorización
│   ├── comments/       # Comentarios de tickets
│   ├── companies/      # Gestión de empresas
│   ├── prisma/         # Configuración de Prisma
│   ├── tickets/        # Gestión de tickets
│   ├── users/          # Gestión de usuarios
│   ├── app.module.ts   # Módulo principal
│   └── main.ts         # Punto de entrada
├── prisma/
│   ├── schema.prisma   # Esquema de la base de datos
│   └── seed.ts         # Datos de prueba
└── package.json
```

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
# Database Configuration (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# JWT Configuration
JWT_SECRET="tu-clave-secreta-super-segura"
JWT_EXPIRES_IN="7d"

# Application Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### 3. Configurar Supabase

1. Crea una cuenta en [Supabase](https://supabase.com/)
2. Crea un nuevo proyecto
3. Ve a Project Settings > Database > Connection String
4. Copia la URL de conexión y pégala en `DATABASE_URL`

### 4. Generar cliente Prisma

```bash
npx prisma generate
```

### 5. Ejecutar migraciones

```bash
npx prisma migrate dev --name init
```

### 6. Sembrar datos de prueba (opcional)

```bash
npm run prisma:seed
```

### 7. Iniciar servidor

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

El servidor estará corriendo en `http://localhost:3001/api`

## 📚 API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/join-company` | Unirse a empresa con código |
| GET | `/api/auth/me` | Obtener perfil actual |

### Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users` | Listar usuarios |
| GET | `/api/users/me` | Obtener mi perfil |
| GET | `/api/users/:id` | Obtener usuario por ID |
| PUT | `/api/users/me` | Actualizar mi perfil |

### Empresas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/companies/:id` | Obtener empresa |
| GET | `/api/companies/:id/stats` | Estadísticas de empresa |
| POST | `/api/companies/:id/regenerate-code` | Regenerar código de invitación |
| GET | `/api/companies/verify-code/:code` | Verificar código de invitación |

### Tickets

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tickets` | Listar tickets |
| GET | `/api/tickets/stats` | Estadísticas de tickets |
| GET | `/api/tickets/:id` | Obtener ticket |
| POST | `/api/tickets` | Crear ticket |
| PUT | `/api/tickets/:id` | Actualizar ticket |
| DELETE | `/api/tickets/:id` | Eliminar ticket |

### Comentarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/comments/ticket/:ticketId` | Listar comentarios de un ticket |
| POST | `/api/comments` | Crear comentario |
| DELETE | `/api/comments/:id` | Eliminar comentario |

## 🔐 Autenticación

Todas las rutas (excepto login y register) requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

## 🧪 Datos de Prueba

Después de ejecutar `npm run prisma:seed`:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@techsolutions.com` | `password123` |
| Empleado | `juan@techsolutions.com` | `password123` |

**Código de invitación:** `TECH01`

## 📝 Comandos Útiles

```bash
# Iniciar en modo desarrollo
npm run start:dev

# Construir para producción
npm run build

# Ejecutar migraciones
npx prisma migrate dev

# Abrir Prisma Studio (UI de base de datos)
npx prisma studio

# Generar cliente Prisma
npx prisma generate

# Sembrar datos de prueba
npm run prisma:seed
```

## 📄 Licencia

MIT
