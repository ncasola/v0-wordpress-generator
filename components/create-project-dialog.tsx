"use client"

import type React from "react"

import { useState, useRef } from "react"
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
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Upload, Image as ImageIcon, Loader2 } from "lucide-react"
import { createProject } from "@/app/actions/projects"
import { generateInspiration } from "@/app/actions/inspiration"
import { toast } from "react-toastify"

interface CreateProjectDialogProps {
  onProjectCreated?: () => void
}

export function CreateProjectDialog({ onProjectCreated }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [inspiration, setInspiration] = useState("")
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [generatingInspiration, setGeneratingInspiration] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerateInspiration = async () => {
    if (!image || !name.trim()) {
      toast.error("Por favor, selecciona una imagen y escribe el nombre del proyecto")
      return
    }

    setGeneratingInspiration(true)
    toast.info("Analizando la imagen y generando inspiración de diseño...")

    try {
      // Convertir imagen a base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string
          const base64Data = base64.split(',')[1] // Remover el prefijo data:image/...

          const result = await generateInspiration(base64Data, name.trim())
          
          if (result.success && result.inspiration) {
            setInspiration(result.inspiration)
            toast.success("¡Inspiración generada! Puedes editarla si lo deseas.")
          } else {
            toast.error(result.error || "No se pudo generar la inspiración de diseño")
          }
        } catch (error) {
          console.error("Error al generar inspiración:", error)
          toast.error("No se pudo generar la inspiración de diseño. Inténtalo de nuevo.")
        } finally {
          setGeneratingInspiration(false)
        }
      }
      reader.readAsDataURL(image)
    } catch (error) {
      console.error("Error al procesar imagen:", error)
      toast.error("No se pudo procesar la imagen. Inténtalo de nuevo.")
      setGeneratingInspiration(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !inspiration.trim()) return

    setLoading(true)
    try {
      const result = await createProject(name.trim(), inspiration.trim())
      
      if (result.success) {
        toast.success("Proyecto creado correctamente")
        setName("")
        setInspiration("")
        setImage(null)
        setImagePreview(null)
        setOpen(false)
        onProjectCreated?.()
      } else {
        toast.error(result.error || "Error al crear el proyecto")
      }
    } catch (error) {
      console.error("Error al crear proyecto:", error)
      toast.error("Error al crear el proyecto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
          <DialogDescription>
            Define el nombre y la inspiración de diseño que se usará en todas las generaciones de este proyecto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Nombre del Proyecto</Label>
            <Input
              id="project-name"
              placeholder="Mi Tema WordPress"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Sección de carga de imagen */}
          <div className="space-y-2">
            <Label>Imagen de Inspiración (Opcional)</Label>
            <div className="space-y-3">
              {imagePreview ? (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{image?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {((image?.size ?? 0) / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImage(null)
                          setImagePreview(null)
                          if (fileInputRef.current) {
                            fileInputRef.current.value = ""
                          }
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Haz clic para subir una imagen de inspiración
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, GIF hasta 10MB
                  </p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {image && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateInspiration}
                  disabled={generatingInspiration || !name.trim()}
                  className="w-full"
                >
                  {generatingInspiration ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analizando imagen y generando inspiración...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {!name.trim() ? "Escribe el nombre del proyecto primero" : "Generar inspiración desde imagen"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-inspiration">Inspiración de Diseño</Label>
            <Textarea
              id="project-inspiration"
              placeholder="Describe el estilo visual, paleta de colores, tipografía y estética general del proyecto..."
              value={inspiration}
              onChange={(e) => setInspiration(e.target.value)}
              rows={8}
              required
              className="resize-none max-h-48 overflow-y-auto"
            />
            <p className="text-sm text-muted-foreground">
              Esta inspiración se usará como contexto en todas las generaciones de código para mantener coherencia
              visual.
            </p>
            {generatingInspiration && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <p className="text-sm text-blue-700">
                  El modelo está analizando tu imagen y generando una inspiración de diseño personalizada...
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Proyecto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
