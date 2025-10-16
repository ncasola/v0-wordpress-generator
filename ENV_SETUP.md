# Configuración de Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# Neon Auth (Stack) Configuration
# Obtén estas claves en: https://app.stack-auth.com
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_stack_publishable_key
STACK_SECRET_SERVER_KEY=your_stack_secret_key

# Neon Database Connection
# Obtén esta URL en: https://console.neon.tech
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Encryption Key para encriptar API keys de usuarios
# Genera una clave con: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
ENCRYPTION_KEY=generate_with_command_above
```

## Pasos de Configuración

1. **Neon Auth (Stack)**:
   - Ve a https://app.stack-auth.com
   - Crea un nuevo proyecto
   - Copia las claves de API

2. **Neon Database**:
   - Ve a https://console.neon.tech
   - Crea un nuevo proyecto
   - Habilita Neon Auth en el proyecto
   - Copia la URL de conexión

3. **Encryption Key**:
   - Ejecuta: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
   - Copia la clave generada

4. **Ejecutar migraciones**:
   - `pnpm prisma migrate dev`

