# Generador de Temas WordPress con v0

Este es un generador de temas WordPress moderno impulsado por IA (OpenAI y V0 Model), diseñado para crear y gestionar componentes de diseño web inspirados en imágenes o descripciones. Escribe tu inspiración visual, sube una imagen y obtén artefactos en HTML utilizando exclusivamente Tailwind CSS v4.

## Características principales

- ✨ Generación de inspiración de diseño a partir de imágenes usando OpenAI Vision
- 🎨 Paletas de colores, tipografías y estilos visuales sugeridos automáticamente
- ⚡ Creación de artefactos (bloques, secciones, páginas) en HTML con Tailwind CSS v4 vía V0 Model
- 🔄 Edición y gestión de artefactos por proyecto
- 🔑 Soporte multiusuario con autenticación Stack (Neon Auth)
- ☁️ Almacenamiento seguro de tus claves de API
- 📦 Compartir y exportar los componentes generados

## Demo

- [wptheme-generator (demo)](https://wptheme-generator.vercel.app/)

## Requisitos

- Node.js >= 18
- Claves de API de OpenAI y V0 Model
- Neon Auth (Stack) para autenticación y base de datos Neon

## Instalación rápida

1. Clona el repositorio:

   ```bash
   git clone https://github.com/ncasola/wptheme-generator.git
   cd wptheme-generator
   ```

2. Instala las dependencias:

   ```bash
   pnpm install
   # o npm install
   ```

3. Configura tus variables de entorno siguiendo [ENV_SETUP.md](./ENV_SETUP.md).

4. Inicia la aplicación en desarrollo:

   ```bash
   pnpm dev
   # o npm run dev
   ```

5. Accede a [http://localhost:3000](http://localhost:3000).

## Flujo de trabajo

1. **Crea un nuevo proyecto**: Define el nombre, una breve descripción y una inspiración visual (texto o imagen).
2. **Genera artefactos**: Elige el tipo de artefacto (sección, página, HTML libre), da un título y opcionalmente un texto.
3. **Visualiza y edita**: Previsualiza el HTML, descarga o modifica el artefacto generado.
4. **Combina tus bloques**: Usa los artefactos exportados para componer temas WordPress o sitios estáticos modernos.

## Stack Tecnológico

- [Next.js](https://nextjs.org/) (App Router)
- [Tailwind CSS v4](https://v4.tailwindcss.com/)
- [OpenAI API](https://platform.openai.com/) & [V0 Model](https://v0.dev/)
- [Stack Auth (Neon)](https://app.stack-auth.com/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL (Neon)](https://neon.tech/)
- [React Toastify](https://fkhadra.github.io/react-toastify/)
- [Radix UI](https://www.radix-ui.com/)

## Variables de entorno

Consulta la guía [ENV_SETUP.md](./ENV_SETUP.md) para configurar correctamente las claves necesarias.

## Roadmap

- [ ] Composición visual drag & drop
- [ ] Más tipos de artefactos (shortcodes, widgets, etc)
- [ ] Exportación directa como tema WordPress
- [ ] Preview responsiva avanzada
- [ ] Integración con sistemas de diseño externos

## Licencia

GPL-3.0

---

Hecho con ❤️ por [Néstor Casola](https://github.com/ncasola)
