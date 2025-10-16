"use server";

import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";
import { V0Service } from "@/lib/services/v0.service";
import { getUserV0ApiKey } from "./api-keys";
import { revalidatePath } from "next/cache";

export interface ArtifactData {
  id: string;
  projectId: string;
  kind: string;
  title: string;
  slug: string;
  inputText?: string | null;
  html: string;
  css?: string | null;
  js?: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Crea un nuevo artefacto usando v0
 */
export async function createArtifact(
  projectId: string,
  kind: "section" | "page" | "html",
  title: string,
  slug: string,
  userText?: string
): Promise<{ success: boolean; artifactId?: string; error?: string }> {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return { success: false, error: "No autenticado" };
    }

    // Buscar el usuario en nuestra DB
    const dbUser = await prisma.user.findUnique({
      where: { stackId: user.id },
    });

    if (!dbUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    // Verificar que el proyecto pertenece al usuario
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: dbUser.id,
      },
    });

    if (!project) {
      return { success: false, error: "Proyecto no encontrado" };
    }

    // Obtener la API key de v0 del usuario
    const v0ApiKey = await getUserV0ApiKey();
    
    if (!v0ApiKey) {
      return {
        success: false,
        error: "API key de v0 no configurada. Por favor, configura tu clave en Configuración.",
      };
    }

    // Generar el artefacto con v0
    const v0Service = new V0Service(v0ApiKey);
    const { html, css, js } = await v0Service.generateArtifact(
      project.inspiration,
      kind,
      title,
      slug,
      userText
    );

    // Guardar en la base de datos
    const artifact = await prisma.artifact.create({
      data: {
        projectId: project.id,
        kind,
        title,
        slug,
        inputText: userText,
        html,
        css,
        js,
        version: 1,
      },
    });

    revalidatePath(`/project/${projectId}`);
    
    return { success: true, artifactId: artifact.id };
  } catch (error) {
    console.error("[createArtifact] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear el artefacto",
    };
  }
}

/**
 * Modifica un artefacto existente usando v0
 */
export async function modifyArtifact(
  artifactId: string,
  changeRequest: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return { success: false, error: "No autenticado" };
    }

    // Buscar el usuario en nuestra DB
    const dbUser = await prisma.user.findUnique({
      where: { stackId: user.id },
    });

    if (!dbUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    // Obtener el artefacto con su proyecto
    const artifact = await prisma.artifact.findUnique({
      where: { id: artifactId },
      include: { project: true },
    });

    if (!artifact) {
      return { success: false, error: "Artefacto no encontrado" };
    }

    // Verificar que el proyecto pertenece al usuario
    if (artifact.project.userId !== dbUser.id) {
      return { success: false, error: "No autorizado" };
    }

    // Obtener la API key de v0 del usuario
    const v0ApiKey = await getUserV0ApiKey();
    
    if (!v0ApiKey) {
      return {
        success: false,
        error: "API key de v0 no configurada. Por favor, configura tu clave en Configuración.",
      };
    }

    // Modificar el artefacto con v0
    const v0Service = new V0Service(v0ApiKey);
    const { html, css, js } = await v0Service.modifyArtifact(
      artifact.project.inspiration,
      artifact.html,
      artifact.css ?? undefined,
      artifact.js ?? undefined,
      changeRequest,
      artifact.slug
    );

    // Actualizar en la base de datos
    await prisma.artifact.update({
      where: { id: artifactId },
      data: {
        html,
        css,
        js,
        version: artifact.version + 1,
      },
    });

    revalidatePath(`/project/${artifact.projectId}`);
    
    return { success: true };
  } catch (error) {
    console.error("[modifyArtifact] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al modificar el artefacto",
    };
  }
}

/**
 * Obtiene todos los artefactos de un proyecto
 */
export async function getArtifactsByProject(projectId: string): Promise<ArtifactData[]> {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return [];
    }

    // Buscar el usuario en nuestra DB
    const dbUser = await prisma.user.findUnique({
      where: { stackId: user.id },
    });

    if (!dbUser) {
      return [];
    }

    // Verificar que el proyecto pertenece al usuario
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: dbUser.id,
      },
    });

    if (!project) {
      return [];
    }

    const artifacts = await prisma.artifact.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
    });

    return artifacts;
  } catch (error) {
    console.error("[getArtifactsByProject] Error:", error);
    return [];
  }
}

/**
 * Obtiene un artefacto específico
 */
export async function getArtifactById(
  artifactId: string
): Promise<{ artifact?: ArtifactData; error?: string }> {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return { error: "No autenticado" };
    }

    // Buscar el usuario en nuestra DB
    const dbUser = await prisma.user.findUnique({
      where: { stackId: user.id },
    });

    if (!dbUser) {
      return { error: "Usuario no encontrado" };
    }

    const artifact = await prisma.artifact.findUnique({
      where: { id: artifactId },
      include: { project: true },
    });

    if (!artifact) {
      return { error: "Artefacto no encontrado" };
    }

    // Verificar que el proyecto pertenece al usuario
    if (artifact.project.userId !== dbUser.id) {
      return { error: "No autorizado" };
    }

    return { artifact };
  } catch (error) {
    console.error("[getArtifactById] Error:", error);
    return {
      error: error instanceof Error ? error.message : "Error al obtener el artefacto",
    };
  }
}

/**
 * Elimina un artefacto
 */
export async function deleteArtifact(
  artifactId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return { success: false, error: "No autenticado" };
    }

    // Buscar el usuario en nuestra DB
    const dbUser = await prisma.user.findUnique({
      where: { stackId: user.id },
    });

    if (!dbUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    // Obtener el artefacto con su proyecto
    const artifact = await prisma.artifact.findUnique({
      where: { id: artifactId },
      include: { project: true },
    });

    if (!artifact) {
      return { success: false, error: "Artefacto no encontrado" };
    }

    // Verificar que el proyecto pertenece al usuario
    if (artifact.project.userId !== dbUser.id) {
      return { success: false, error: "No autorizado" };
    }

    await prisma.artifact.delete({
      where: { id: artifactId },
    });

    revalidatePath(`/project/${artifact.projectId}`);
    
    return { success: true };
  } catch (error) {
    console.error("[deleteArtifact] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al eliminar el artefacto",
    };
  }
}

