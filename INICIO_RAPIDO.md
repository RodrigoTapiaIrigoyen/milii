# 🚀 Guía de Inicio Rápido - LuxProfile MX

## ⚡ Configuración en 5 Minutos

### 1. Instalar Dependencias

```bash
cd premium-profiles
npm install
```

### 2. Configurar MongoDB

**Opción A: MongoDB Atlas (Recomendado - Gratis)**

1. Ve a https://www.mongodb.com/cloud/atlas
2. Crea cuenta gratuita
3. Crea cluster (M0 Sandbox)
4. En "Database Access": Crea usuario
5. En "Network Access": Agrega `0.0.0.0/0`
6. Copia string de conexión

**Opción B: MongoDB Local**

```bash
# Instalar MongoDB localmente
# En Ubuntu/Debian:
sudo apt install mongodb

# String de conexión:
mongodb://localhost:27017/luxprofile
```

### 3. Configurar Variables de Entorno

Edita el archivo `.env.local` que ya está creado:

```bash
# Reemplaza estos valores:

# MongoDB - Pega tu string de conexión
MONGODB_URI=mongodb+srv://TU_USUARIO:TU_PASSWORD@cluster.mongodb.net/luxprofile?retryWrites=true&w=majority

# JWT Secret - Genera uno nuevo
# Ejecuta: openssl rand -base64 32
JWT_SECRET=TU_SECRET_GENERADO_AQUI

# MercadoPago (opcional por ahora)
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR_xxxxxxxxxxxx
MERCADOPAGO_ACCESS_TOKEN=APP_USR_xxxxxxxxxxxx

# Deja estas igual:
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**Generar JWT Secret:**

```bash
openssl rand -base64 32
```

### 4. Crear Usuario Administrador

```bash
npm run admin
```

Te pedirá:

- Email: `admin@luxprofile.mx`
- Password: (mínimo 6 caracteres)

### 5. Iniciar la Aplicación

```bash
npm run dev
```

### 6. ¡Listo!

Abre tu navegador en:

```
http://localhost:3000
```

---

## 📝 Primeros Pasos

### Como Usuario:

1. **Registrarse**
   - Ve a `/register`
   - Crea cuenta con email y password

2. **Crear Perfil**
   - Accede al dashboard
   - Click en "Crear Perfil"
   - Completa información
   - Sube fotos

3. **Elegir Plan**
   - Ve a "Planes"
   - Elige Free (gratis 7 días) o Premium/VIP

4. **Publicar Perfil**
   - Desde tu perfil, click "Publicar"
   - Tu perfil estará visible públicamente

### Como Administrador:

1. **Login**
   - Usa el email/password que creaste

2. **Panel Admin**
   - Ve a `/admin`
   - Verás estadísticas
   - Gestiona perfiles de usuarios

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Crear admin
npm run admin

# Build producción
npm run build

# Iniciar producción
npm start

# Linting
npm run lint
```

---

## 📚 Documentación Completa

Lee estos archivos para más detalles:

- `README_CONFIGURACION.md` - Guía detallada de configuración
- `RESUMEN_APLICACION.md` - Resumen completo de funcionalidades
- `.env.example` - Ejemplo de variables de entorno

---

## 🆘 Problemas Comunes

### Error: Cannot connect to MongoDB

- Verifica que `MONGODB_URI` esté correcto
- Si usas Atlas, verifica Network Access (0.0.0.0/0)
- Verifica usuario y contraseña

### Error: JWT must be provided

- Verifica que `JWT_SECRET` esté configurado en `.env.local`
- Reinicia el servidor después de cambiar `.env.local`

### Error: Cannot find module

- Ejecuta `npm install` de nuevo
- Elimina `node_modules` y ejecuta `npm install`

---

## 🎯 Siguiente Nivel

Una vez funcionando, puedes:

1. **Personalizar Diseño**
   - Edita colores en `tailwind.config.js`
   - Modifica componentes en `src/app`

2. **Agregar Funcionalidades**
   - Sistema de favoritos
   - Búsqueda avanzada
   - Mensajería interna

3. **Desplegar en Producción**
   - Vercel (recomendado)
   - Railway
   - Render

---

## ✅ Checklist de Configuración

- [ ] Dependencias instaladas (`npm install`)
- [ ] MongoDB configurado (Atlas o local)
- [ ] Variables de entorno en `.env.local`
- [ ] Usuario admin creado (`npm run admin`)
- [ ] Aplicación corriendo (`npm run dev`)
- [ ] Login funcionando
- [ ] Dashboard accesible

---

## 🎉 ¡Listo!

Tu aplicación está lista para usarse. ¡Empieza a personalizar! 🚀

**Soporte:**

- Lee `README_CONFIGURACION.md` para detalles
- Revisa `RESUMEN_APLICACION.md` para funcionalidades
- Revisa código en `/src` para entender estructura
