"use server";

import { stackServerApp } from "@/stack/server";
import { OpenAIService } from "@/lib/services/openai.service";
import { getUserOpenAiApiKey } from "./api-keys";

/**
 * Genera inspiración de diseño a partir de una imagen usando OpenAI Vision
 */
export async function generateInspiration(
  imageBase64: string,
  projectTitle: string
): Promise<{ success: boolean; inspiration?: string; error?: string }> {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return { success: false, error: "No autenticado" };
    }

    // Obtener la API key de OpenAI del usuario
    const openAiApiKey = await getUserOpenAiApiKey();
    
    if (!openAiApiKey) {
      return {
        success: false,
        error: "API key de OpenAI no configurada. Por favor, configura tu clave en Configuración.",
      };
    }

    // Generar inspiración con OpenAI
    const openAiService = new OpenAIService(openAiApiKey);
    const inspiration = await openAiService.generateDesignInspiration(
      imageBase64,
      projectTitle
    );

    return { success: true, inspiration };
  } catch (error) {
    console.error("[generateInspiration] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al generar inspiración",
    };
  }
}

