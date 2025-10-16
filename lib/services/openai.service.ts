import { generateText, ModelMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { OpenAIProvider } from "@ai-sdk/openai";

/**
 * Servicio para interactuar con la API de OpenAI
 */
export class OpenAIService {
  private apiKey: string;
  private client: OpenAIProvider;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("OpenAI API key es requerida");
    }
    this.apiKey = apiKey;
    this.client = createOpenAI({
      apiKey: this.apiKey,
    });
  }

  /**
   * Genera inspiración de diseño basada en una imagen
   */
  async generateDesignInspiration(
    imageBase64: string,
    projectTitle: string
  ): Promise<string> {
    const systemMessage = `Eres un experto en diseño web y en la generación de inspiración de diseño. Tu tarea es analizar una imagen y generar una inspiración de diseño detallada para un proyecto web titulado "${projectTitle}".
    INSTRUCCIONES:
    1. Analiza los colores, tipografías, estilos y elementos visuales de la imagen
    2. Genera una paleta de colores coherente con códigos hex específicos
    3. Define el estilo de tipografía apropiado (nombres de fuentes)
    4. Describe el mood y la estética general
    5. Sugiere elementos de diseño que se puedan aplicar a componentes web
    6. Mantén un tono profesional y técnico
    7. La inspiración debe ser específica y actionable para desarrollo web con Tailwind CSS v4
    8. Responde en español y sé muy específico con los detalles técnicos.`;
    const messages: ModelMessage[] = [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: [
          {
            type: "image",
            image: imageBase64,
          },
        ],
      },
    ];
    const model = this.client("gpt-4o-mini");
    const result = await generateText({
      model,
      messages,
    });
    return result.text;
  }
}
