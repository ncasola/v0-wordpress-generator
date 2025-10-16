"use server";

import { prisma } from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";
import { revalidatePath } from "next/cache";

export interface ProjectData {
  id: string;
  name: string;
  inspiration: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Crea un nuevo proyecto para el usuario autenticado
 */
export async function createProject(
  name: string,
  inspiration: string
): Promise<{ success: boolean; projectId?: string; error?: string }> {
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

    // Crear el proyecto
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        inspiration: inspiration.trim(),
        userId: dbUser.id,
      },
    });

    revalidatePath("/");
    
    return { success: true, projectId: project.id };
  } catch (error) {
    console.error("[createProject] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear el proyecto",
    };
  }
}

/**
 * Obtiene todos los proyectos del usuario autenticado
 */
export async function getProjects(): Promise<ProjectData[]> {
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

    const projects = await prisma.project.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });

    return projects;
  } catch (error) {
    console.error("[getProjects] Error:", error);
    return [];
  }
}

/**
 * Obtiene un proyecto específico del usuario autenticado
 */
export async function getProjectById(
  projectId: string
): Promise<{ project?: ProjectData; error?: string }> {
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

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: dbUser.id,
      },
    });

    if (!project) {
      return { error: "Proyecto no encontrado" };
    }

    return { project };
  } catch (error) {
    console.error("[getProjectById] Error:", error);
    return {
      error: error instanceof Error ? error.message : "Error al obtener el proyecto",
    };
  }
}

/**
 * Elimina un proyecto del usuario autenticado
 */
export async function deleteProject(
  projectId: string
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

    // Eliminar el proyecto (Prisma eliminará los artefactos automáticamente por cascade)
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: dbUser.id,
      },
    });

    if (!project) {
      return { success: false, error: "Proyecto no encontrado" };
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("[deleteProject] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al eliminar el proyecto",
    };
  }
}

