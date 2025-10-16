"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Folder, Trash2, Calendar } from "lucide-react"
import type { ProjectData } from "@/app/actions/projects"
import { deleteProject } from "@/app/actions/projects"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

interface ProjectCardProps {
  project: ProjectData
  onDelete?: () => void
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const router = useRouter()

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`¿Estás seguro de que quieres eliminar el proyecto "${project.name}"?`)) return

    try {
      const result = await deleteProject(project.id)
      if (result.success) {
        toast.success("Proyecto eliminado correctamente")
        onDelete?.()
      } else {
        toast.error(result.error || "Error al eliminar el proyecto")
      }
    } catch (error) {
      console.error("Error al eliminar proyecto:", error)
      toast.error("Error al eliminar el proyecto")
    }
  }

  const handleClick = () => {
    router.push(`/project/${project.id}`)
  }

  return (
    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={handleClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{project.name}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="flex items-center gap-1 text-xs">
          <Calendar className="h-3 w-3" />
          {new Date(project.createdAt).toLocaleDateString("es-ES")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{project.inspiration}</p>
      </CardContent>
    </Card>
  )
}
