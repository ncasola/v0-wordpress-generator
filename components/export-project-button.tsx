"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { exportProjectAsZip } from "@/lib/export"
import type { ProjectData } from "@/app/actions/projects"
import { toast } from "react-toastify"

interface ExportProjectButtonProps {
  project: ProjectData
}

export function ExportProjectButton({ project }: ExportProjectButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      await exportProjectAsZip(project.id, project.name)
      toast.success("Proyecto exportado correctamente")
    } catch (error) {
      console.error("Error al exportar:", error)
      toast.error("Error al exportar el proyecto. Verifica que tenga artefactos.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={loading} variant="outline">
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exportando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Descargar ZIP
        </>
      )}
    </Button>
  )
}
