"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Eye, Code, Download } from "lucide-react"
import type { ArtifactData } from "@/app/actions/artifacts"
import type { ProjectData } from "@/app/actions/projects"
import { ModifyArtifactDialog } from "@/components/modify-artifact-dialog"

interface ArtifactViewerProps {
  artifact: ArtifactData
  project: ProjectData
  onModified?: () => void
}

export function ArtifactViewer({ artifact, project, onModified }: ArtifactViewerProps) {
  const [activeTab, setActiveTab] = useState("preview")
  const [previewContent, setPreviewContent] = useState("")

  // Cargar fuentes disponibles desde el archivo JSON
  const getAvailableFonts = async (): Promise<string[]> => {
    try {
      const response = await fetch('/api-response.json')
      const data = await response.json()
      console.log(data)
      return data.map((item: any) => item.family) || []
    } catch (error) {
      console.error('Error cargando fuentes:', error)
      return []
    }
  }

  // Extraer fuentes de la inspiración del proyecto usando el listado de fuentes disponibles
  const extractFontsFromInspiration = async (inspiration: string): Promise<string[]> => {
    const availableFonts = await getAvailableFonts()
    console.log(availableFonts)
    if (availableFonts.length === 0) return []
    
    const foundFonts: string[] = []
    
    // Buscar cada fuente disponible en la inspiración
    for (const font of availableFonts) {
      const fontRegex = new RegExp(`\\b${font.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      if (fontRegex.test(inspiration)) {
        foundFonts.push(font)
      }
    }
    console.log(foundFonts)
    return foundFonts.slice(0, 3) // Limitar a 3 fuentes máximo
  }

  // Cargar contenido de vista previa cuando cambie el artefacto o proyecto
  useEffect(() => {
    const loadPreviewContent = async () => {
      const content = await getPreviewContent()
      setPreviewContent(content)
    }
    loadPreviewContent()
  }, [artifact, project])

  // Combinar HTML con CSS y JS para la vista previa
  const getPreviewContent = async () => {
    const fonts = await extractFontsFromInspiration(project.inspiration)
    const googleFontsUrl = fonts.length > 0 
      ? `https://fonts.googleapis.com/css2?${fonts.map(font => `family=${font.replace(/\s+/g, '+')}:wght@300;400;500;600;700`).join('&')}&display=swap`
      : ''

    let content = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${artifact.title}</title>
  <script src="https://cdn.tailwindcss.com"></script>`

    if (googleFontsUrl) {
      content += `\n  <link href="${googleFontsUrl}" rel="stylesheet">`
    }

    content += `
  <style>
    body {
      margin: 0;
      padding: 0;
    }`

    if (fonts.length > 0) {
      content += `
    /* Fuentes de la inspiración del proyecto */
    * {
      font-family: "${fonts[0]}", ${fonts.slice(1).map(font => `"${font}"`).join(', ')}, system-ui, -apple-system, sans-serif;
    }`
    }

    content += `
  </style>`

    if (artifact.css) {
      content += `\n  <style>${artifact.css}</style>`
    }

    content += `
</head>
<body>
  ${artifact.html}`

    if (artifact.js) {
      content += `\n  <script>${artifact.js}</script>`
    }

    content += `
</body>
</html>`

    return content
  }

  const handleDownload = () => {
    const blob = new Blob([previewContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${artifact.slug}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{artifact.title}</CardTitle>
            <CardDescription>
              Versión {artifact.version} • {artifact.kind} • .{artifact.slug}__*
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <ModifyArtifactDialog project={project} artifact={artifact} onArtifactModified={onModified} />
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Vista Previa
            </TabsTrigger>
            <TabsTrigger value="html" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              HTML
            </TabsTrigger>
            <TabsTrigger value="css-js" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              CSS/JS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 mt-4">
            <div className="border rounded-lg overflow-hidden h-full bg-white">
              <iframe
                srcDoc={previewContent}
                className="w-full h-full"
                title={`Preview: ${artifact.title}`}
                sandbox="allow-scripts"
              />
            </div>
          </TabsContent>

          <TabsContent value="html" className="flex-1 mt-4">
            <ScrollArea className="h-full border rounded-lg">
              <pre className="p-4 text-sm">
                <code>{artifact.html}</code>
              </pre>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="css-js" className="flex-1 mt-4 space-y-4">
            <ScrollArea className="h-[45%] border rounded-lg">
              <div className="p-4">
                <div className="text-xs font-semibold text-muted-foreground mb-2">CSS</div>
                <pre className="text-sm">
                  <code>{artifact.css || "// Sin estilos CSS"}</code>
                </pre>
              </div>
            </ScrollArea>
            <ScrollArea className="h-[45%] border rounded-lg">
              <div className="p-4">
                <div className="text-xs font-semibold text-muted-foreground mb-2">JavaScript</div>
                <pre className="text-sm">
                  <code>{artifact.js || "// Sin código JavaScript"}</code>
                </pre>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
