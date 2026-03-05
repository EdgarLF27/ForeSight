# 🎫 TicketClass - Sistema de Gestión de Tickets

Sistema de gestión de tickets estilo Google Classroom. Las empresas pueden crear su espacio de trabajo y los empleados se unen mediante un código de invitación.

## 🏗️ Arquitectura

- **Frontend:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend:** NestJS + TypeScript
- **Base de datos:** PostgreSQL (Supabase)
- **ORM:** Prisma

---

## 🚀 Inicio Rápido

### 1. Descargar el proyecto

```bash
cd ticketclass-app
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

**Edita el archivo `.env` con tus credenciales de Supabase:**

```env
# Obtén esta URL desde Supabase > Project Settings > Database > Connection String
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

JWT_SECRET="tu-clave-secreta-minimo-32-caracteres"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

**Configurar Supabase:**
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Ve a **Project Settings > Database > Connection String**
4. Copia la URL y pégala en `DATABASE_URL`

**Inicializar base de datos:**

```bash
# Generar cliente Prisma
npx prisma generate

# Crear tablas en la base de datos
npx prisma migrate dev --name init

# (Opcional) Agregar datos de prueba
npm run prisma:seed
```

**Iniciar servidor backend:**

```bash
npm run start:dev
```

El backend estará en `http://localhost:3001/api`

---

### 3. Configurar Frontend (Client)

```bash
cd ../client

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
```

**El archivo `.env` ya tiene la configuración por defecto:**

```env
VITE_API_URL=http://localhost:3001/api
```

**Iniciar servidor frontend:**

```bash
npm run dev
```

El frontend estará en `http://localhost:5173`

---

## 🔑 Cuentas de Demo (si ejecutaste seed)

| Rol | Email | Contraseña |
|-----|-------|------------|
| **Admin** | `admin@techsolutions.com` | `password123` |
| **Empleado** | `juan@techsolutions.com` | `password123` |

**Código de invitación:** `TECH01`

---

## 📁 Estructura del Proyecto

```
ticketclass-app/
├── README.md              # Este archivo
├── start.sh               # Script de ayuda
│
├── backend/               # API NestJS
│   ├── src/
│   │   ├── auth/         # Login, registro, JWT
│   │   ├── comments/     # Comentarios de tickets
│   │   ├── companies/    # Gestión de empresas
│   │   ├── prisma/       # Conexión a base de datos
│   │   ├── tickets/      # CRUD de tickets
│   │   └── users/        # Gestión de usuarios
│   ├── prisma/
│   │   ├── schema.prisma # Esquema de base de datos
│   │   └── seed.ts       # Datos de prueba
│   ├── .env.example      # Variables de entorno ejemplo
│   └── package.json
│
└── client/                # React App (Frontend)
    ├── src/
    │   ├── components/   # Componentes React
    │   ├── hooks/        # Custom hooks
    │   ├── services/     # API calls (axios)
    │   └── types/        # TypeScript types
    ├── .env.example      # Variables de entorno ejemplo
    └── package.json
```

---

## 🛠️ Comandos Útiles

### Backend

```bash
cd backend

# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod

# Base de datos
npx prisma studio              # UI de base de datos
npx prisma migrate dev         # Nueva migración
npm run prisma:seed            # Datos de prueba
```

### Client (Frontend)

```bash
cd client

# Desarrollo
npm run dev

# Producción
npm run build

# Preview
npm run preview
```

---

## 📚 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/join-company` | Unirse con código |
| GET | `/api/tickets` | Listar tickets |
| POST | `/api/tickets` | Crear ticket |
| PUT | `/api/tickets/:id` | Actualizar ticket |
| GET | `/api/comments/ticket/:id` | Comentarios |
| POST | `/api/comments` | Crear comentario |

---

## ⚙️ Configuración de Supabase

1. **Crear proyecto:**
   - Ve a [supabase.com](https://supabase.com)
   - Crea una cuenta o inicia sesión
   - Click en "New Project"

2. **Obtener Connection String:**
   - En tu proyecto, ve a **Project Settings** (icono de engranaje)
   - Ve a **Database**
   - En **Connection String**, selecciona **URI**
   - Copia la URL y reemplaza `[YOUR-PASSWORD]` con tu contraseña

3. **La URL se ve así:**
   ```
   postgresql://postgres:tu-password@db.tu-project-ref.supabase.co:5432/postgres
   ```

---

## 🐛 Solución de Problemas

### Error de conexión a base de datos
```bash
# Verificar que la URL de Supabase esté correcta
# Asegúrate de reemplazar [YOUR-PASSWORD] con tu contraseña real
```

### Error "JWT_SECRET too short"
```bash
# Genera una clave segura:
openssl rand -base64 32
```

### Puerto ocupado
```bash
# Cambia el puerto en backend/.env
PORT=3002
```

---

## 📝 Notas Importantes

- ✅ **Los datos se guardan en PostgreSQL/Supabase** (no en localStorage/caché)
- ✅ **Autenticación con JWT tokens**
- ✅ **API REST con NestJS**
- ✅ **Frontend con React + TypeScript**
- ✅ **Todas las operaciones CRUD persisten en la base de datos**

---

## 📄 Licencia

MIT - Proyecto educativo para universidad
