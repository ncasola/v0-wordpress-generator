# Instrucciones de Configuración Final

¡La migración de la aplicación ha sido completada! Aquí están los pasos finales para poner en marcha tu aplicación.

## ✅ Cambios Completados

### 1. Base de Datos y Autenticación
- ✅ Instalado Prisma y @stackframe/stack (Neon Auth)
- ✅ Creado schema de Prisma con modelos: User, ApiKey, Project, Artifact
- ✅ Configurado encriptación de API keys
- ✅ Generado cliente de Prisma

### 2. Arquitectura del Código
- ✅ Refactorizado código a clases: `V0Service` y `OpenAIService`
- ✅ Creados Server Actions para todas las operaciones
- ✅ Eliminado Dexie (IndexedDB) y migrado a PostgreSQL
- ✅ Eliminado localStorage y migrado a base de datos encriptada

### 3. UI y UX
- ✅ Implementado react-toastify en lugar de toast custom
- ✅ Actualizado layout con Stack Auth Provider
- ✅ Creado componente UserMenu con autenticación
- ✅ Actualizado todos los componentes para usar Server Actions

### 4. Prompts de IA
- ✅ Actualizado prompt de v0 para usar **SOLO Tailwind CSS v4**
- ✅ Eliminado generación de CSS custom
- ✅ Añadido soporte para arbitrary values de Tailwind

### 5. Limpieza
- ✅ Eliminados 40+ componentes de shadcn no usados
- ✅ Eliminados archivos obsoletos (db.ts, storage.ts, v0-api.ts)
- ✅ Eliminada dependencia de Dexie

## 🚀 Próximos Pasos (IMPORTANTE)

### Paso 1: Configurar Neon y Stack Auth

1. **Crea una cuenta en Neon Tech**:
   - Ve a [https://console.neon.tech](https://console.neon.tech)
   - Crea un nuevo proyecto
   - Copia la cadena de conexión (DATABASE_URL)

2. **Habilita Neon Auth en tu proyecto**:
   - En tu proyecto de Neon, ve a la sección "Auth"
   - Habilita Neon Auth
   - Esto automáticamente te proporcionará acceso a Stack Auth

3. **Crea un proyecto en Stack Auth**:
   - Ve a [https://app.stack-auth.com](https://app.stack-auth.com)
   - Crea un nuevo proyecto
   - Copia las siguientes claves:
     - `NEXT_PUBLIC_STACK_PROJECT_ID`
     - `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
     - `STACK_SECRET_SERVER_KEY`

### Paso 2: Crear archivo .env.local

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Neon Auth (Stack) Configuration
NEXT_PUBLIC_STACK_PROJECT_ID=tu_stack_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=tu_stack_publishable_key
STACK_SECRET_SERVER_KEY=tu_stack_secret_key

# Neon Database Connection
DATABASE_URL=postgresql://usuario:password@host/database?sslmode=require

# Encryption Key para API keys de usuarios
# Genera una clave ejecutando este comando en PowerShell:
# node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
ENCRYPTION_KEY=tu_clave_base64_generada
```

### Paso 3: Ejecutar Migraciones de Prisma

```bash
# Ejecuta las migraciones para crear las tablas en Neon
pnpm prisma migrate dev --name init

# Si hay problemas, puedes hacer push directo:
pnpm prisma db push
```

### Paso 4: Iniciar la Aplicación

```bash
pnpm dev
```

### Paso 5: Configurar tus API Keys

1. Abre [http://localhost:3000](http://localhost:3000)
2. Inicia sesión o crea una cuenta
3. Ve a la pestaña "Configuración"
4. Añade tus API keys:
   - **v0 API Key**: Obtén una en [v0.dev](https://v0.dev)
   - **OpenAI API Key**: Obtén una en [platform.openai.com](https://platform.openai.com)

## 📁 Estructura Nueva del Proyecto

```
├── app/
│   ├── actions/              # Server Actions
│   │   ├── api-keys.ts       # Gestión de API keys encriptadas
│   │   ├── artifacts.ts      # CRUD de artefactos + generación con v0
│   │   ├── inspiration.ts    # Generación de inspiración con OpenAI
│   │   └── projects.ts       # CRUD de proyectos
│   ├── handler/
│   │   └── [...stack]/       # Rutas de autenticación de Stack
│   ├── project/[id]/         # Vista de proyecto individual
│   ├── layout.tsx            # Layout con Stack Provider y ToastContainer
│   └── page.tsx              # Página principal con auth
├── components/
│   ├── user-menu.tsx         # Nuevo: Menú de usuario con Stack
│   ├── api-key-settings.tsx  # Actualizado: Usa Server Actions
│   ├── create-project-dialog.tsx
│   ├── create-artifact-dialog.tsx
│   ├── modify-artifact-dialog.tsx
│   └── ui/                   # Solo componentes usados (9 en total)
├── lib/
│   ├── services/
│   │   ├── v0.service.ts     # Clase para v0 API (Tailwind v4)
│   │   └── openai.service.ts # Clase para OpenAI API
│   ├── encryption.ts         # Utilidades de encriptación
│   ├── prisma.ts             # Cliente de Prisma
│   ├── export.tsx            # Exportación a ZIP
│   └── utils.ts              # Utilidades generales
├── prisma/
│   └── schema.prisma         # Schema de base de datos
├── stack/
│   ├── client.tsx            # Stack client config
│   └── server.tsx            # Stack server config
└── ENV_SETUP.md              # Guía de variables de entorno
```

## 🎨 Cambios en Generación de Código

### Antes:
```typescript
// Generaba CSS custom
const result = await generateArtifact(...)
// Output: HTML + <style>CSS personalizado</style> + <script>JS</script>
```

### Ahora:
```typescript
// Genera SOLO clases de Tailwind v4
const result = await V0Service.generateArtifact(...)
// Output: HTML con clases Tailwind + <script>JS</script>
// Sin tags <style>, usa solo utilidades de Tailwind
```

### Ejemplo de Output Esperado:

```html
<section data-component="hero-section" class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
  <h1 class="text-5xl font-bold text-white mb-4">Bienvenido</h1>
  <p class="text-xl text-white/90 max-w-2xl text-center">
    Tu aplicación ahora usa Tailwind CSS v4
  </p>
  <button class="mt-8 px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
    Comenzar
  </button>
</section>
```

## 🔐 Seguridad

- ✅ API keys encriptadas en base de datos con AES-256-GCM
- ✅ Autenticación con Stack Auth (Neon Auth)
- ✅ Server Actions para operaciones sensibles
- ✅ Cada usuario solo ve sus propios datos
- ✅ HTTPS requerido en producción

## 📝 Notas Importantes

1. **Generación de ENCRYPTION_KEY**: Esta clave es CRÍTICA. Guárdala en lugar seguro y NO la compartas.
   
2. **Tailwind v4**: Los artefactos ahora se generan con clases de Tailwind. Si necesitas estilos muy específicos, v0 puede usar arbitrary values: `bg-[#abc123]`, `w-[347px]`

3. **Migración de datos antiguos**: Los datos de Dexie (localStorage) no se migran automáticamente. Si necesitas tus datos antiguos, tendrás que recrearlos manualmente.

4. **API Keys por usuario**: Cada usuario debe configurar sus propias API keys de v0 y OpenAI en la sección de Configuración.

## 🐛 Solución de Problemas

### Error: "Prisma Client not found"
```bash
pnpm prisma generate
```

### Error: "Can't reach database server"
- Verifica que DATABASE_URL esté correcta en `.env.local`
- Asegúrate de que tu base de datos Neon esté activa

### Error: "ENCRYPTION_KEY not set"
- Genera una clave: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- Añádela a `.env.local`

### Error: "Stack Auth not configured"
- Verifica las variables de Stack en `.env.local`
- Asegúrate de haber creado el proyecto en app.stack-auth.com

## 📚 Recursos

- [Neon Docs](https://neon.tech/docs)
- [Stack Auth Docs](https://docs.stack-auth.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [React Toastify Docs](https://fkhadra.github.io/react-toastify)

---

¡Listo! Tu aplicación ahora está modernizada con PostgreSQL, autenticación real, y arquitectura escalable. 🎉

