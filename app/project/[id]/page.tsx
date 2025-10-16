"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "@stackframe/stack"
import { getProjectById, type ProjectData } from "@/app/actions/projects"
import { getArtifactsByProject, type ArtifactData } from "@/app/actions/artifacts"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileCode, Loader2, Eye, EyeOff } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CreateArtifactDialog } from "@/components/create-artifact-dialog"
import { ArtifactCard } from "@/components/artifact-card"
import { ArtifactViewer } from "@/components/artifact-viewer"
import { ExportProjectButton } from "@/components/export-project-button"

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const user = useUser()
  const projectId = params.id as string

  const [project, setProject] = useState<ProjectData | null>(null)
  const [artifacts, setArtifacts] = useState<ArtifactData[]>([])
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactData | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProject = async () => {
    try {
      setLoading(true)
      const projectResult = await getProjectById(projectId)
      
      if (projectResult.error || !projectResult.project) {
        console.error("Error al cargar proyecto:", projectResult.error)
        router.push("/")
        return
      }

      setProject(projectResult.project)

      const artifactsData = await getArtifactsByProject(projectId)
      setArtifacts(artifactsData)

      // Seleccionar el primer artefacto si existe
      if (artifactsData.length > 0 && !selectedArtifact) {
        setSelectedArtifact(artifactsData[0])
      }
    } catch (error) {
      console.error("Error al cargar proyecto:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadProject()
    } else {
      router.push("/")
    }
  }, [projectId, user])

  const handleArtifactModified = async () => {
    await loadProject()
    // Recargar el artefacto seleccionado
    if (selectedArtifact) {
      const updatedArtifacts = await getArtifactsByProject(projectId)
      const updated = updatedArtifacts.find((a) => a.id === selectedArtifact.id)
      if (updated) {
        setSelectedArtifact(updated)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground line-clamp-1 flex-1">{project.inspiration}</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Inspiración del Proyecto</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                          {project.inspiration}
                        </pre>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <ExportProjectButton project={project} />
            <CreateArtifactDialog project={project} onArtifactCreated={loadProject} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-180px)]">
          {/* Sidebar con lista de artefactos */}
          <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Artefactos</h2>
              <span className="text-sm text-muted-foreground">{artifacts.length}</span>
            </div>

            {artifacts.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <FileCode className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-medium">No hay artefactos</h3>
                  <p className="text-sm text-muted-foreground">Crea tu primer artefacto</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {artifacts.map((artifact) => (
                  <ArtifactCard
                    key={artifact.id}
                    artifact={artifact}
                    onDelete={loadProject}
                    onSelect={() => setSelectedArtifact(artifact)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Área principal de visualización */}
          <div className="col-span-12 lg:col-span-8 xl:col-span-9">
            {selectedArtifact ? (
              <ArtifactViewer artifact={selectedArtifact} project={project} onModified={handleArtifactModified} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-2">
                  <FileCode className="h-16 w-16 mx-auto" />
                  <p>Selecciona un artefacto para visualizarlo</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
