# 🔧 ARQUITECTURA BACKEND - LuxProfile MX

## ✅ SÍ TENEMOS BACKEND COMPLETO Y FUNCIONAL

El proyecto usa **Next.js 14 App Router** que integra el backend dentro de la misma aplicación (no necesitas un servidor Express separado).

---

## 📁 ESTRUCTURA DEL BACKEND

### 1️⃣ **API Routes** (`/src/app/api/`)

Son los endpoints del servidor que procesan peticiones HTTP:

```
src/app/api/
├── auth/                      # 🔐 Autenticación
│   ├── login/route.ts        ✅ POST - Iniciar sesión (MongoDB)
│   ├── register/route.ts     ✅ POST - Registrar usuario (MongoDB)
│   ├── logout/route.ts       ✅ POST - Cerrar sesión
│   ├── me/route.ts          ✅ GET - Usuario actual (MongoDB)
│   ├── change-email/route.ts ✅ POST - Cambiar email (MongoDB)
│   ├── change-password/route.ts ✅ POST - Cambiar contraseña (MongoDB)
│   └── delete-account/route.ts ✅ POST - Eliminar cuenta (MongoDB + cascada)
│
├── profiles/                  # 👤 Perfiles
│   ├── route.ts              ✅ GET/POST - Listar/Crear perfiles (MongoDB)
│   ├── my-profile/route.ts   ✅ GET - Mi perfil (MongoDB)
│   ├── public/route.ts       ✅ GET - Perfiles públicos (MongoDB)
│   ├── featured/route.ts     ✅ GET - Perfiles destacados (MongoDB)
│   ├── [id]/route.ts         ✅ GET/PUT/DELETE - CRUD perfil (MongoDB)
│   ├── [id]/public/route.ts  ✅ GET - Perfil público + incrementar vistas (MongoDB)
│   └── [id]/track-click/route.ts ✅ POST - Tracking de clicks (MongoDB)
│
├── subscriptions/             # 💳 Suscripciones
│   ├── route.ts              ✅ GET/POST - Gestionar suscripción (MongoDB)
│   └── cancel/route.ts       ✅ POST - Cancelar suscripción (MongoDB)
│
├── payments/                  # 💰 Pagos
│   └── create-preference/route.ts ✅ POST - MercadoPago (MongoDB)
│
├── upload/                    # 📸 Subir archivos
│   └── route.ts              ✅ POST - Subir fotos (FileSystem + MongoDB)
│
└── admin/                     # 👑 Administración
    ├── dashboard/route.ts    ✅ GET - Stats admin (MongoDB)
    └── profiles/
        └── [id]/route.ts     ✅ PUT - Gestión admin (MongoDB)
```

---

## 🗄️ BASE DE DATOS MONGODB ATLAS

### **Conexión** (`/src/lib/db.ts`)

```typescript
import mongoose from "mongoose";

export async function connectDB() {
  // Conexión a MongoDB Atlas
  await mongoose.connect(process.env.MONGODB_URI);
}
```

**Estado:** ✅ **CONECTADO Y FUNCIONANDO**

- URL: `mongodb+srv://luxprofile_admin:lWwwIrOcuGMXJtE7@milieroti.plmjjis.mongodb.net/luxprofile`
- Base de datos: `luxprofile`
- Servidor: MongoDB Atlas (Cloud)

---

## 📊 MODELOS DE BASE DE DATOS (`/src/models/`)

Todos conectados a MongoDB con Mongoose:

### 1. **User.ts** - Usuarios

```typescript
{
  email: String,           // Único
  password: String,        // Hash bcrypt
  role: String,            // 'user', 'admin'
  createdAt: Date,
  lastLogin: Date
}
```

**Usado en:** Login, Register, Change Password, Delete Account

### 2. **Profile.ts** - Perfiles Profesionales

```typescript
{
  userId: ObjectId,        // Referencia a User
  name: String,
  age: Number,
  description: String,
  whatsapp: String,
  telegram: String,
  photos: [String],        // Array de URLs
  services: [String],
  pricing: {
    hourlyRate: Number,
    serviceRate: Number
  },
  location: {
    state: String,
    city: String,
    zone: String
  },
  verification: {
    isVerified: Boolean
  },
  stats: {
    views: Number,
    whatsappClicks: Number,
    favorites: Number
  },
  isPublished: Boolean,
  createdAt: Date
}
```

**Usado en:** Crear Perfil, Editar, Búsqueda, Vista Pública, Analytics

### 3. **Subscription.ts** - Suscripciones

```typescript
{
  userId: ObjectId,
  plan: String,            // 'free', 'premium', 'vip'
  status: String,          // 'active', 'expired', 'cancelled'
  startDate: Date,
  endDate: Date,
  price: Number
}
```

**Usado en:** Planes, Dashboard, Permisos

### 4. **Payment.ts** - Pagos

```typescript
{
  userId: ObjectId,
  subscriptionId: ObjectId,
  amount: Number,
  currency: String,
  status: String,          // 'pending', 'approved', 'rejected'
  paymentMethod: String,
  mercadopagoId: String,
  createdAt: Date
}
```

**Usado en:** MercadoPago, Historial

### 5. **Verification.ts** - Verificaciones

```typescript
{
  profileId: ObjectId,
  userId: ObjectId,
  status: String,
  documents: [String],
  verifiedAt: Date
}
```

**Usado en:** Sistema de verificación de perfiles

### 6. **AdminLog.ts** - Logs de Administración

```typescript
{
  adminId: ObjectId,
  action: String,
  targetModel: String,
  targetId: ObjectId,
  details: Object,
  createdAt: Date
}
```

**Usado en:** Auditoría de acciones admin

### 7. **Sanction.ts** - Sanciones

```typescript
{
  userId: ObjectId,
  profileId: ObjectId,
  reason: String,
  type: String,
  startDate: Date,
  endDate: Date,
  isActive: Boolean
}
```

**Usado en:** Moderación de contenido

---

## 🔥 OPERACIONES MONGODB IMPLEMENTADAS

### **CREATE (Insertar)**

```typescript
// Crear usuario
await User.create({ email, password: hashedPassword });

// Crear perfil
await Profile.create({ userId, name, age, ... });

// Crear suscripción
await Subscription.create({ userId, plan, ... });
```

### **READ (Consultar)**

```typescript
// Buscar por ID
await User.findById(userId);

// Buscar uno con filtro
await User.findOne({ email });

// Buscar múltiples
await Profile.find({ isPublished: true });

// Con ordenamiento y límite
await Profile.find().sort({ "stats.views": -1 }).limit(6);

// Con select (campos específicos)
await Profile.find().select("name photos pricing").lean();
```

### **UPDATE (Actualizar)**

```typescript
// Actualizar uno
await User.findByIdAndUpdate(userId, {
  email: newEmail,
});

// Incrementar contador
await Profile.findByIdAndUpdate(profileId, {
  $inc: { "stats.views": 1 },
});

// Actualizar y retornar nuevo
await Profile.findByIdAndUpdate(profileId, updateData, { new: true });
```

### **DELETE (Eliminar)**

```typescript
// Eliminar uno
await User.findByIdAndDelete(userId);

// Eliminar múltiples
await Profile.deleteMany({ userId });

// Eliminación en cascada
await Profile.deleteMany({ userId });
await Subscription.deleteMany({ userId });
await User.findByIdAndDelete(userId);
```

---

## 🔌 ENDPOINTS API QUE USAN MONGODB

### **Autenticación (7 endpoints)**

| Método | Endpoint                    | MongoDB Operation                                                                 |
| ------ | --------------------------- | --------------------------------------------------------------------------------- |
| POST   | `/api/auth/register`        | `User.create()`                                                                   |
| POST   | `/api/auth/login`           | `User.findOne()` + `user.save()`                                                  |
| POST   | `/api/auth/logout`          | Solo cookies                                                                      |
| GET    | `/api/auth/me`              | `User.findById()`                                                                 |
| POST   | `/api/auth/change-email`    | `User.findById()` + `user.save()`                                                 |
| POST   | `/api/auth/change-password` | `User.findById()` + `user.save()`                                                 |
| POST   | `/api/auth/delete-account`  | `Profile.deleteMany()` + `Subscription.deleteMany()` + `User.findByIdAndDelete()` |

### **Perfiles (9 endpoints)**

| Método | Endpoint                         | MongoDB Operation                      |
| ------ | -------------------------------- | -------------------------------------- |
| POST   | `/api/profiles`                  | `Profile.create()`                     |
| GET    | `/api/profiles`                  | `Profile.find()`                       |
| GET    | `/api/profiles/my-profile`       | `Profile.findOne({ userId })`          |
| GET    | `/api/profiles/public`           | `Profile.find({ isPublished: true })`  |
| GET    | `/api/profiles/featured`         | `Profile.find().sort().limit(6)`       |
| GET    | `/api/profiles/[id]`             | `Profile.findById()`                   |
| GET    | `/api/profiles/[id]/public`      | `Profile.findOne()` + `$inc views`     |
| PUT    | `/api/profiles/[id]`             | `Profile.findByIdAndUpdate()`          |
| POST   | `/api/profiles/[id]/track-click` | `Profile.findByIdAndUpdate()` + `$inc` |

### **Suscripciones (2 endpoints)**

| Método | Endpoint                    | MongoDB Operation                  |
| ------ | --------------------------- | ---------------------------------- |
| GET    | `/api/subscriptions`        | `Subscription.findOne({ userId })` |
| POST   | `/api/subscriptions/cancel` | `Subscription.findByIdAndUpdate()` |

### **Pagos (1 endpoint)**

| Método | Endpoint                          | MongoDB Operation                            |
| ------ | --------------------------------- | -------------------------------------------- |
| POST   | `/api/payments/create-preference` | `Payment.create()` + `Subscription.create()` |

### **Upload (1 endpoint)**

| Método | Endpoint      | Operación                             |
| ------ | ------------- | ------------------------------------- |
| POST   | `/api/upload` | FileSystem + retorna URL para MongoDB |

### **Admin (2 endpoints)**

| Método | Endpoint                   | MongoDB Operation                                                   |
| ------ | -------------------------- | ------------------------------------------------------------------- |
| GET    | `/api/admin/dashboard`     | `User.countDocuments()` + `Profile.countDocuments()` + agregaciones |
| PUT    | `/api/admin/profiles/[id]` | `Profile.findByIdAndUpdate()` + `AdminLog.create()`                 |

---

## 📈 FEATURES IMPLEMENTADAS CON MONGODB

### ✅ **Sistema de Analytics en Tiempo Real**

```typescript
// Incrementar vistas automáticamente
await Profile.findByIdAndUpdate(profileId, {
  $inc: { "stats.views": 1 },
});

// Registrar clicks de WhatsApp
await Profile.findByIdAndUpdate(profileId, {
  $inc: { "stats.whatsappClicks": 1 },
});
```

### ✅ **Búsqueda y Filtros**

```typescript
const query: any = { isPublished: true };

// Filtros dinámicos
if (state) query["location.state"] = state;
if (service) query.services = service;
if (minPrice) query["pricing.hourlyRate"] = { $gte: minPrice };

const profiles = await Profile.find(query);
```

### ✅ **Autenticación con JWT**

```typescript
// Verificar usuario
const user = await User.findOne({ email });
const isValid = await user.comparePassword(password);

// Actualizar último login
user.lastLogin = new Date();
await user.save();
```

### ✅ **Eliminación en Cascada**

```typescript
// Al eliminar cuenta, eliminar todo relacionado
await Profile.deleteMany({ userId });
await Subscription.deleteMany({ userId });
await Payment.updateMany({ userId }, { status: "cancelled" });
await User.findByIdAndDelete(userId);
```

### ✅ **Verificación de Perfiles**

```typescript
const profile = await Profile.findById(id);
profile.verification.isVerified = true;
profile.verification.verifiedAt = new Date();
await profile.save();
```

---

## 🔒 SEGURIDAD IMPLEMENTADA

### **Passwords**

- ✅ Hash con bcryptjs (10 rounds)
- ✅ Método `comparePassword()` en modelo User
- ✅ Nunca se envía el password en respuestas

### **Autenticación**

- ✅ JWT tokens
- ✅ HTTP-only cookies (no accesibles por JavaScript)
- ✅ Middleware `getUserFromRequest()` para proteger rutas

### **Validación**

- ✅ Mongoose schemas con validaciones
- ✅ Validación manual en endpoints
- ✅ Sanitización de inputs

---

## 🚀 CÓMO FUNCIONA EN PRODUCCIÓN

1. **Usuario hace petición** → `http://localhost:3000/api/auth/login`
2. **Next.js procesa** → Ejecuta `/src/app/api/auth/login/route.ts`
3. **Backend se conecta a MongoDB** → `await connectDB()`
4. **Ejecuta consulta** → `await User.findOne({ email })`
5. **Procesa lógica** → Valida password, genera JWT
6. **Guarda en MongoDB** → `await user.save()`
7. **Retorna respuesta** → `NextResponse.json({ ... })`

---

## 📝 EJEMPLO COMPLETO DE FLUJO

### **Crear un Perfil:**

```typescript
// Frontend hace POST
fetch('/api/profiles', {
  method: 'POST',
  body: JSON.stringify({ name, age, ... })
});

// Backend (route.ts)
export async function POST(req: NextRequest) {
  await connectDB();                    // 1. Conectar MongoDB
  const userId = await getUserFromRequest(req); // 2. Autenticar
  const data = await req.json();        // 3. Obtener datos

  const profile = await Profile.create({ // 4. Guardar en MongoDB
    userId,
    ...data
  });

  return NextResponse.json({ profile }); // 5. Responder
}
```

---

## ✅ CONCLUSIÓN

**TODO EL BACKEND ESTÁ CONECTADO A MONGODB:**

✅ 20+ endpoints API funcionando  
✅ 7 modelos de datos (User, Profile, Subscription, etc.)  
✅ CRUD completo en todos los modelos  
✅ Autenticación con JWT  
✅ Analytics en tiempo real  
✅ Sistema de búsqueda y filtros  
✅ Upload de archivos  
✅ Eliminación en cascada  
✅ Validaciones y seguridad

**No necesitas crear un backend separado.** Next.js ya lo incluye con las API Routes que funcionan como endpoints de servidor completamente integrados con MongoDB Atlas.

🔥 **La aplicación está 100% conectada y funcional con MongoDB.**
