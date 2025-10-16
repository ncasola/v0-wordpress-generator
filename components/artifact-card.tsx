"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileCode, Trash2, Calendar } from "lucide-react"
import type { ArtifactData } from "@/app/actions/artifacts"
import { deleteArtifact } from "@/app/actions/artifacts"
import { toast } from "react-toastify"

interface ArtifactCardProps {
  artifact: ArtifactData
  onDelete?: () => void
  onSelect?: () => void
}

export function ArtifactCard({ artifact, onDelete, onSelect }: ArtifactCardProps) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`¿Estás seguro de que quieres eliminar "${artifact.title}"?`)) return

    try {
      const result = await deleteArtifact(artifact.id)
      if (result.success) {
        toast.success("Artefacto eliminado correctamente")
        onDelete?.()
      } else {
        toast.error(result.error || "Error al eliminar el artefacto")
      }
    } catch (error) {
      console.error("Error al eliminar artefacto:", error)
      toast.error("Error al eliminar el artefacto")
    }
  }

  const kindLabels: Record<string, string> = {
    section: "Sección",
    page: "Página",
    html: "HTML",
  }

  return (
    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={onSelect}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <FileCode className="h-5 w-5 text-primary" />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{artifact.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-xs mt-1">
                <Badge variant="secondary" className="text-xs">
                  {kindLabels[artifact.kind]}
                </Badge>
                <span className="text-muted-foreground">v{artifact.version}</span>
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(artifact.createdAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="text-xs">
            <span className="font-mono bg-muted px-2 py-1 rounded">.{artifact.slug}__*</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
