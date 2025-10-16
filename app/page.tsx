"use client"

import { useEffect, useState } from "react"
import { useUser } from "@stackframe/stack"
import { getProjects, type ProjectData } from "@/app/actions/projects"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { ProjectCard } from "@/components/project-card"
import { ApiKeySettings } from "@/components/api-key-settings"
import { UserMenu } from "@/components/user-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Settings, FolderOpen, Loader2, LogIn } from "lucide-react"
import { SignIn } from "@stackframe/stack"

export default function HomePage() {
  const user = useUser()
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(true)

  const loadProjects = async () => {
    try {
      setLoading(true)
      const allProjects = await getProjects()
      setProjects(allProjects)
    } catch (error) {
      console.error("Error al cargar proyectos:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadProjects()
    } else {
      setLoading(false)
    }
  }, [user])

  // Si no está autenticado, mostrar página de login
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Generador de Temas WordPress con v0</h1>
            <p className="text-sm text-muted-foreground">Crea y gestiona proyectos de diseño con IA</p>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Bienvenido</h2>
              <p className="text-muted-foreground">
                Inicia sesión o crea una cuenta para comenzar a crear proyectos de diseño con IA
              </p>
            </div>
            <SignIn />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Generador de Temas WordPress con v0</h1>
              <p className="text-sm text-muted-foreground">Crea y gestiona proyectos de diseño con IA</p>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Proyectos
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Mis Proyectos</h2>
                <p className="text-sm text-muted-foreground">
                  {projects.length} {projects.length === 1 ? "proyecto" : "proyectos"}
                </p>
              </div>
              <CreateProjectDialog onProjectCreated={loadProjects} />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium">No hay proyectos</h3>
                  <p className="text-sm text-muted-foreground">Crea tu primer proyecto para comenzar</p>
                </div>
                <CreateProjectDialog onProjectCreated={loadProjects} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} onDelete={loadProjects} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <ApiKeySettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
