"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Loader2 } from "lucide-react"
import type { ProjectData } from "@/app/actions/projects"
import type { ArtifactData } from "@/app/actions/artifacts"
import { modifyArtifact as modifyArtifactAction } from "@/app/actions/artifacts"
import { toast } from "react-toastify"

interface ModifyArtifactDialogProps {
  project: ProjectData
  artifact: ArtifactData
  onArtifactModified?: () => void
}

export function ModifyArtifactDialog({ project, artifact, onArtifactModified }: ModifyArtifactDialogProps) {
  const [open, setOpen] = useState(false)
  const [changeRequest, setChangeRequest] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!changeRequest.trim()) return

    setLoading(true)
    setError("")

    try {
      const result = await modifyArtifactAction(
        artifact.id,
        changeRequest.trim()
      )

      if (result.success) {
        toast.success("Artefacto modificado correctamente")
        setChangeRequest("")
        setOpen(false)
        onArtifactModified?.()
      } else {
        setError(result.error || "Error al modificar el artefacto")
        toast.error(result.error || "Error al modificar el artefacto")
      }
    } catch (err) {
      console.error("Error al modificar artefacto:", err)
      const errorMsg = err instanceof Error ? err.message : "Error al modificar el artefacto"
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Modificar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modificar Artefacto</DialogTitle>
          <DialogDescription>
            Describe los cambios que quieres aplicar a "{artifact.title}" (v{artifact.version})
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="change-request">Solicitud de Cambio</Label>
            <Textarea
              id="change-request"
              placeholder="Cambia el color del botón a azul, añade un efecto hover, ajusta el espaciado..."
              value={changeRequest}
              onChange={(e) => setChangeRequest(e.target.value)}
              rows={8}
              required
              disabled={loading}
              className="resize-none"
            />
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Modificando...
                </>
              ) : (
                "Aplicar Cambios"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
