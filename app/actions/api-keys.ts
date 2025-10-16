"use server";

import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";
import { stackServerApp } from "@/stack/server";

/**
 * Guarda las API keys de un usuario (encriptadas)
 */
export async function saveApiKeys(
  v0Key?: string,
  openAiKey?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return { success: false, error: "No autenticado" };
    }

    // Buscar o crear el usuario en nuestra DB
    const dbUser = await prisma.user.upsert({
      where: { stackId: user.id },
      update: {
        email: user.primaryEmail ?? "",
        name: user.displayName ?? undefined,
      },
      create: {
        stackId: user.id,
        email: user.primaryEmail ?? "",
        name: user.displayName ?? undefined,
      },
    });

    // Encriptar las claves si se proporcionan
    const encryptedV0Key = v0Key ? encrypt(v0Key) : undefined;
    const encryptedOpenAiKey = openAiKey ? encrypt(openAiKey) : undefined;

    // Upsert: crear o actualizar las API keys del usuario
    await prisma.apiKey.upsert({
      where: { userId: dbUser.id },
      update: {
        v0ApiKey: encryptedV0Key,
        openAiApiKey: encryptedOpenAiKey,
      },
      create: {
        userId: dbUser.id,
        v0ApiKey: encryptedV0Key,
        openAiApiKey: encryptedOpenAiKey,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[saveApiKeys] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al guardar las API keys",
    };
  }
}

/**
 * Obtiene las API keys de un usuario (desencriptadas)
 */
export async function getApiKeys(): Promise<{
  v0ApiKey?: string;
  openAiApiKey?: string;
  error?: string;
}> {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return { error: "No autenticado" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { stackId: user.id },
    });

    if (!dbUser) {
      return {};
    }

    const apiKeys = await prisma.apiKey.findUnique({
      where: { userId: dbUser.id },
    });

    if (!apiKeys) {
      return {};
    }

    // Desencriptar las claves si existen
    const v0ApiKey = apiKeys.v0ApiKey ? decrypt(apiKeys.v0ApiKey) : undefined;
    const openAiApiKey = apiKeys.openAiApiKey ? decrypt(apiKeys.openAiApiKey) : undefined;

    return { v0ApiKey, openAiApiKey };
  } catch (error) {
    console.error("[getApiKeys] Error:", error);
    return {
      error: error instanceof Error ? error.message : "Error al obtener las API keys",
    };
  }
}

/**
 * Verifica si un usuario tiene al menos una API key configurada
 */
export async function hasApiKeys(): Promise<boolean> {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return false;
    }

    const dbUser = await prisma.user.findUnique({
      where: { stackId: user.id },
    });

    if (!dbUser) {
      return false;
    }

    const apiKeys = await prisma.apiKey.findUnique({
      where: { userId: dbUser.id },
      select: { v0ApiKey: true, openAiApiKey: true },
    });

    return !!(apiKeys && (apiKeys.v0ApiKey || apiKeys.openAiApiKey));
  } catch (error) {
    console.error("[hasApiKeys] Error:", error);
    return false;
  }
}

/**
 * Obtiene la API key de v0 del usuario autenticado
 * (Helper para uso interno en otros Server Actions)
 */
export async function getUserV0ApiKey(): Promise<string | undefined> {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return undefined;
    }

    const dbUser = await prisma.user.findUnique({
      where: { stackId: user.id },
    });

    if (!dbUser) {
      return undefined;
    }

    const apiKeys = await prisma.apiKey.findUnique({
      where: { userId: dbUser.id },
      select: { v0ApiKey: true },
    });

    if (!apiKeys?.v0ApiKey) {
      return undefined;
    }

    return decrypt(apiKeys.v0ApiKey);
  } catch (error) {
    console.error("[getUserV0ApiKey] Error:", error);
    return undefined;
  }
}

/**
 * Obtiene la API key de OpenAI del usuario autenticado
 * (Helper para uso interno en otros Server Actions)
 */
export async function getUserOpenAiApiKey(): Promise<string | undefined> {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return undefined;
    }

    const dbUser = await prisma.user.findUnique({
      where: { stackId: user.id },
    });

    if (!dbUser) {
      return undefined;
    }

    const apiKeys = await prisma.apiKey.findUnique({
      where: { userId: dbUser.id },
      select: { openAiApiKey: true },
    });

    if (!apiKeys?.openAiApiKey) {
      return undefined;
    }

    return decrypt(apiKeys.openAiApiKey);
  } catch (error) {
    console.error("[getUserOpenAiApiKey] Error:", error);
    return undefined;
  }
}

