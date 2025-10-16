import { generateText } from "ai";
import { createVercel } from "@ai-sdk/vercel";

/**
 * Servicio para interactuar con la API de v0 Model
 */
export class V0Service {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("V0 API key es requerida");
    }
    this.apiKey = apiKey;
  }

  /**
   * Genera un artefacto usando la API de v0 Model con Tailwind v4
   */
  async generateArtifact(
    inspiration: string,
    kind: string,
    title: string,
    slug: string,
    userText?: string
  ): Promise<{ html: string; css?: string; js?: string }> {
    const message = `${inspiration}

TAREA:
Genera un bloque tipo "${kind}" titulado "${title}".
${userText ? `Contenido solicitado: ${userText}` : "(sin texto adicional)"}

PARAMS:
Slug: ${slug}

REGLAS ESTRICTAS:
1. USA SOLO CLASES DE TAILWIND CSS V4. NO generes etiquetas <style>.
2. Si recibes HTML, mantén la estructura pero aplica clases de Tailwind.
3. Si no recibes HTML, genera SOLO los <section> necesarios con clases de Tailwind.
4. No uses <html>, <head> ni <body>.
5. Todas las clases deben ser de Tailwind v4. Si necesitas estilos muy específicos, usa clases Tailwind arbitrary: [propiedad:valor]
6. Prefijos de clases solo para identificación: usa data-component="${slug}" en el elemento raíz.
7. JS solo si es indispensable. Vanilla. Un único <script>.
8. Accesibilidad AA, etiquetas alt, orden lógico de headings.
9. Orden de salida: HTML → <script> (si hay).
10. NO incluyas <Thinking>, NO uses bloques de código markdown, NO incluyas explicaciones.
11. Devuelve SOLO el código HTML/JS limpio.
12. IMPORTANTE: Usa SOLO clases de Tailwind. NO generes CSS custom. NO uses <style>.

CONTEXTO DE DISEÑO:
- Inspiración, paleta, tipografía y estética coherente con el proyecto.
- Data attribute: data-component="${slug}"
- Look colorido, elegante, profesional, accesible.
- Usa las utilidades de Tailwind v4 para colores, espaciado, tipografía, etc.

EJEMPLOS DE TAILWIND V4:
- Colores: bg-blue-500, text-gray-900
- Espaciado: p-4, m-8, gap-6
- Flex: flex, flex-col, items-center, justify-between
- Grid: grid, grid-cols-3, gap-4
- Typography: text-xl, font-bold, leading-tight
- Responsive: sm:flex, md:grid-cols-2, lg:p-8
- Estados: hover:bg-blue-600, focus:ring-2
- Arbitrary values si es necesario: bg-[#abc123], w-[347px]`;

    try {
      console.log("[v0] Generating artifact with v0 Model API");

      const vercel = createVercel({
        apiKey: this.apiKey,
      });

      const result = await generateText({
        model: vercel("v0-1.5-md"),
        prompt: message,
      });

      console.log("[v0] Generated content:", result.text);

      return this.parseGeneratedContent(result.text);
    } catch (error) {
      console.error("[v0] Error al generar artefacto:", error);
      throw error;
    }
  }

  /**
   * Modifica un artefacto existente usando la API de v0 Model con Tailwind v4
   */
  async modifyArtifact(
    inspiration: string,
    currentHtml: string,
    currentCss: string | undefined,
    currentJs: string | undefined,
    changeRequest: string,
    slug: string
  ): Promise<{ html: string; css?: string; js?: string }> {
    const message = `${inspiration}

CONTEXTO ACTUAL:
HTML:
${currentHtml}

${currentCss ? `CSS ANTERIOR (ya no usar):\n${currentCss}` : ""}

${currentJs ? `JS:\n${currentJs}` : ""}

SOLICITUD DE CAMBIO:
${changeRequest}

REGLAS ESTRICTAS:
1. USA SOLO CLASES DE TAILWIND CSS V4. NO generes etiquetas <style>.
2. Mantén el data-component="${slug}" en el elemento raíz
3. No uses <html>, <head> ni <body>
4. Mantén la accesibilidad AA
5. JS vanilla mínimo si es necesario
6. Orden de salida: HTML → <script> (si hay)
7. NO incluyas <Thinking>, NO uses bloques de código markdown, NO incluyas explicaciones
8. Devuelve SOLO el código HTML/JS limpio
9. IMPORTANTE: Convierte cualquier CSS custom a clases de Tailwind v4
10. Si hay estilos que no se pueden replicar con Tailwind, usa arbitrary values: [propiedad:valor]

EJEMPLOS DE CONVERSIÓN CSS → TAILWIND:
- background-color: #abc123 → bg-[#abc123]
- padding: 20px → p-5
- display: flex; justify-content: space-between → flex justify-between
- font-size: 18px; font-weight: bold → text-lg font-bold`;

    try {
      console.log("[v0] Modifying artifact with v0 Model API");

      const vercel = createVercel({
        apiKey: this.apiKey,
      });

      const result = await generateText({
        model: vercel("v0-1.5-md"),
        prompt: message,
      });

      console.log("[v0] Modified content:", result.text);

      return this.parseGeneratedContent(result.text);
    } catch (error) {
      console.error("[v0] Error al modificar artefacto:", error);
      throw error;
    }
  }

  /**
   * Parsea el contenido generado para extraer HTML, CSS y JS
   * Nota: Con Tailwind v4, no debería haber CSS, pero mantenemos la compatibilidad
   */
  private parseGeneratedContent(content: string): {
    html: string;
    css?: string;
    js?: string;
  } {
    let html = "";
    let css = "";
    let js = "";

    // Limpiar contenido de <Thinking> y bloques de código markdown
    let cleanContent = content
      .replace(/<Thinking>[\s\S]*?<\/Thinking>/gi, "")
      .replace(/```html[\s\S]*?```/gi, "")
      .replace(/```[\s\S]*?```/gi, "")
      .trim();

    // Extraer bloques <style> (no debería haber con Tailwind, pero por compatibilidad)
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    const styleMatches = cleanContent.matchAll(styleRegex);
    for (const match of styleMatches) {
      css += match[1] + "\n";
    }

    // Extraer bloques <script>
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    const scriptMatches = cleanContent.matchAll(scriptRegex);
    for (const match of scriptMatches) {
      js += match[1] + "\n";
    }

    // Remover <style> y <script> del contenido para obtener solo HTML
    html = cleanContent.replace(styleRegex, "").replace(scriptRegex, "").trim();

    // Limpiar HTML de contenido extra
    html = html
      .replace(/<Thinking>[\s\S]*?<\/Thinking>/gi, "")
      .replace(/```html[\s\S]*?```/gi, "")
      .replace(/```[\s\S]*?```/gi, "")
      .trim();

    console.log(
      "[v0] Parsed content - HTML length:",
      html.length,
      "CSS length:",
      css.length,
      "JS length:",
      js.length
    );

    return {
      html,
      css: css.trim() || undefined,
      js: js.trim() || undefined,
    };
  }
}

