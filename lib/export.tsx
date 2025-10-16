import JSZip from "jszip"
import type { ArtifactData } from "@/app/actions/artifacts"
import { getArtifactsByProject } from "@/app/actions/artifacts"

/**
 * Exporta todos los artefactos de un proyecto como archivo ZIP
 */
export async function exportProjectAsZip(projectId: string, projectName: string): Promise<void> {
  try {
    // Obtener todos los artefactos del proyecto
    const artifacts = await getArtifactsByProject(projectId)

    if (artifacts.length === 0) {
      throw new Error("No hay artefactos para exportar")
    }

    // Crear instancia de JSZip
    const zip = new JSZip()

    // Crear carpeta raíz con el nombre del proyecto
    const projectFolder = zip.folder(projectName.replace(/[^a-z0-9-_]/gi, "_"))

    if (!projectFolder) {
      throw new Error("Error al crear carpeta del proyecto")
    }

    // Añadir cada artefacto como archivo HTML
    artifacts.forEach((artifact) => {
      const content = buildArtifactFile(artifact)
      const fileName = `${artifact.slug}.html`
      projectFolder.file(fileName, content)
    })

    // Crear archivo README con información del proyecto
    const readme = `# ${projectName}

Proyecto generado con v0 WordPress Generator

## Artefactos incluidos

${artifacts
  .map(
    (a) => `- **${a.title}** (${a.kind})
  - Archivo: ${a.slug}.html
  - Versión: ${a.version}
  - Clases CSS: .${a.slug}__*`,
  )
  .join("\n\n")}

## Uso

Cada archivo HTML contiene:
- Estructura HTML del componente
- Estilos CSS embebidos en <style>
- JavaScript (si aplica) en <script>

Las clases CSS están prefijadas con el slug del artefacto para evitar conflictos.
`

    projectFolder.file("README.md", readme)

    // Generar el ZIP
    const blob = await zip.generateAsync({ type: "blob" })

    // Descargar el archivo
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${projectName.replace(/[^a-z0-9-_]/gi, "_")}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error al exportar proyecto:", error)
    throw error
  }
}

/**
 * Construye el contenido completo de un artefacto
 */
function buildArtifactFile(artifact: ArtifactData): string {
  let content = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${artifact.title}</title>
  <!-- 
    Tipo: ${artifact.kind} 
    Versión: ${artifact.version} 
    Slug: ${artifact.slug} 
  -->
</head>
<body>
${artifact.html}`

  if (artifact.css) {
    content += `

<style>
${artifact.css}
</style>`
  }

  if (artifact.js) {
    content += `

<script>
${artifact.js}
</script>`
  }

  content += `
</body>
</html>`

  return content
}
