# 🚀 Guía de Configuración - LuxProfile MX

## 📋 Requisitos Previos

- Node.js 18+ instalado
- MongoDB Atlas cuenta (gratuita)
- Cuenta de MercadoPago (para pagos)

---

## ⚙️ Configuración Inicial

### 1️⃣ Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/luxprofile?retryWrites=true&w=majority

# JWT Secret (genera uno seguro con: openssl rand -base64 32)
JWT_SECRET=tu-clave-secreta-super-larga-y-aleatoria-minimo-32-caracteres

# MercadoPago
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR_xxxxxxxxxxxx
MERCADOPAGO_ACCESS_TOKEN=APP_USR_xxxxxxxxxxxx

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 2️⃣ Configurar MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (M0 Sandbox - Gratis)
4. Ve a "Database Access" y crea un usuario con contraseña
5. Ve a "Network Access" y agrega `0.0.0.0/0` (permitir todas las IPs)
6. Ve a "Connect" → "Connect your application"
7. Copia el string de conexión y reemplaza en `MONGODB_URI`

### 3️⃣ Generar JWT Secret

Ejecuta en terminal:

```bash
openssl rand -base64 32
```

Copia el resultado y pégalo en `JWT_SECRET`

### 4️⃣ Configurar MercadoPago (Opcional - para pagos)

1. Ve a [MercadoPago Developers](https://www.mercadopago.com.mx/developers)
2. Crea una aplicación
3. Ve a "Credenciales" y copia:
   - Public Key → `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
   - Access Token → `MERCADOPAGO_ACCESS_TOKEN`

---

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Abrir en navegador
http://localhost:3000
```

---

## 👤 Crear Usuario Administrador

Ejecuta el script para crear un admin:

```bash
npm run admin
```

Te pedirá:

- Email del administrador
- Contraseña

---

## 🗂️ Estructura de la Aplicación

### Modelos de Datos

**User**

- email
- password (hasheada)
- role (user | admin)
- isActive

**Profile**

- userId
- artisticName
- age
- description
- whatsapp
- photos (array)
- pricing { hourlyRate, serviceRate, currency }
- location { country, state, city, zone }
- categories { serviceType[], gender, orientation, availability[] }
- stats { views, whatsappClicks, favorites }
- status (draft | published | suspended)
- isVerified, isFeatured, isPremium

**Subscription**

- userId
- profileId
- plan (free | premium | vip)
- status (active | expired | cancelled)
- startDate, endDate, nextBillingDate
- priceAmount, currency

**Payment**

- userId, profileId, subscriptionId
- amount, currency
- status (pending | completed | failed | refunded)
- method, externalId

---

## 🔐 API Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario actual

### Perfiles

- `GET /api/profiles` - Listar perfiles (público)
- `POST /api/profiles` - Crear perfil
- `GET /api/profiles/my-profile` - Obtener mi perfil
- `PUT /api/profiles/my-profile` - Actualizar mi perfil
- `DELETE /api/profiles/my-profile` - Eliminar mi perfil
- `POST /api/profiles/my-profile/publish` - Publicar perfil
- `GET /api/profiles/[id]` - Ver perfil por ID

### Suscripciones

- `GET /api/subscriptions` - Obtener mi suscripción
- `POST /api/subscriptions` - Crear suscripción
- `POST /api/subscriptions/cancel` - Cancelar suscripción

### Upload

- `POST /api/upload` - Subir imagen
- `DELETE /api/upload?url=/uploads/xxx` - Eliminar imagen

### Admin (solo admin)

- `GET /api/admin/dashboard` - Estadísticas
- `GET /api/admin/profiles` - Listar todos los perfiles
- `PUT /api/admin/profiles/[id]` - Actualizar perfil
- `DELETE /api/admin/profiles/[id]` - Eliminar perfil

---

## 🎨 Rutas Frontend

### Públicas

- `/` - Home
- `/login` - Iniciar sesión
- `/register` - Registrarse
- `/profiles` - Explorar perfiles

### Dashboard (requiere autenticación)

- `/dashboard` - Panel principal
- `/dashboard/perfil` - Gestionar mi perfil
- `/dashboard/fotos` - Gestionar fotos
- `/dashboard/planes` - Ver planes de suscripción
- `/dashboard/suscripcion` - Mi suscripción
- `/dashboard/configuracion` - Configuración

### Admin (requiere rol admin)

- `/admin` - Panel de administración
- `/admin/perfiles` - Gestionar perfiles
- `/admin/usuarios` - Gestionar usuarios

---

## 💾 Tipos de Servicios Sugeridos

```typescript
const serviceTypes = [
  "Masajes Terapéuticos",
  "Masajes Relajantes",
  "Acompañamiento Ejecutivo",
  "Acompañamiento a Eventos",
  "Acompañamiento a Cenas",
  "Personal Shopper",
  "Consultoría de Imagen",
  // Agrega más según tu modelo de negocio
];
```

---

## 📱 Planes de Suscripción

### Free (Gratis)

- Duración: 7 días
- Perfil básico
- 3 fotos máximo

### Premium ($499 MXN/mes)

- Perfil destacado
- 10 fotos
- Sin marca de agua
- Verificación rápida

### VIP ($999 MXN/mes)

- Todo lo de Premium
- Perfil ultra destacado
- Fotos ilimitadas
- Soporte prioritario

---

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT tokens en cookies HTTP-only
- ✅ Middleware de autenticación
- ✅ Validación de roles (user/admin)
- ✅ Protección CSRF con SameSite cookies
- ✅ Variables de entorno para secretos

---

## 🚀 Próximos Pasos

1. Configura `.env.local` con tus credenciales
2. Ejecuta `npm install`
3. Ejecuta `npm run dev`
4. Crea un usuario admin con `npm run admin`
5. Abre http://localhost:3000
6. ¡Empieza a personalizar!

---

## 📞 Soporte

Si necesitas ayuda con la configuración, revisa:

- Modelo de datos en `/src/models`
- API en `/src/app/api`
- Componentes en `/src/app`

¡Buena suerte con tu plataforma! 🎉
