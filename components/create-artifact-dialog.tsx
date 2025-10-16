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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Loader2 } from "lucide-react"
import type { ProjectData } from "@/app/actions/projects"
import { createArtifact } from "@/app/actions/artifacts"
import { toast } from "react-toastify"

interface CreateArtifactDialogProps {
  project: ProjectData
  onArtifactCreated?: () => void
}

export function CreateArtifactDialog({ project, onArtifactCreated }: CreateArtifactDialogProps) {
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<"section" | "page" | "html">("section")
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [userText, setUserText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !slug.trim()) return

    setLoading(true)
    setError("")

    try {
      const result = await createArtifact(
        project.id,
        kind,
        title.trim(),
        slug.trim(),
        userText.trim() || undefined
      )

      if (result.success) {
        toast.success("Artefacto generado correctamente")
        // Resetear formulario
        setTitle("")
        setSlug("")
        setUserText("")
        setKind("section")
        setOpen(false)
        onArtifactCreated?.()
      } else {
        setError(result.error || "Error al generar el artefacto")
        toast.error(result.error || "Error al generar el artefacto")
      }
    } catch (err) {
      console.error("Error al generar artefacto:", err)
      const errorMsg = err instanceof Error ? err.message : "Error al generar el artefacto"
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Auto-generar slug desde el título
  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slug) {
      const autoSlug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
      setSlug(autoSlug)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Artefacto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generar Nuevo Artefacto</DialogTitle>
          <DialogDescription>
            Crea una nueva sección, página o bloque HTML usando la inspiración del proyecto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="artifact-kind">Tipo de Artefacto</Label>
            <Select value={kind} onValueChange={(value: any) => setKind(value)}>
              <SelectTrigger id="artifact-kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="section">Sección</SelectItem>
                <SelectItem value="page">Página</SelectItem>
                <SelectItem value="html">Bloque HTML</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="artifact-title">Título</Label>
            <Input
              id="artifact-title"
              placeholder="Hero Section, About Page, Contact Form..."
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="artifact-slug">Slug (prefijo de clases CSS)</Label>
            <Input
              id="artifact-slug"
              placeholder="hero-section, about-page, contact-form..."
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Las clases CSS se generarán como .{slug}__elemento</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="artifact-text">Descripción / Contenido (opcional)</Label>
            <Textarea
              id="artifact-text"
              placeholder="Describe qué debe contener este artefacto, textos específicos, funcionalidades..."
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              rows={6}
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
                  Generando...
                </>
              ) : (
                "Generar con v0"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
