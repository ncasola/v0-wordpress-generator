"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { saveApiKeys, getApiKeys } from "@/app/actions/api-keys"
import { toast } from "react-toastify"
import { Key, Trash2, Loader2 } from "lucide-react"

export function ApiKeySettings() {
  const [v0ApiKey, setV0ApiKeyValue] = useState("")
  const [openaiApiKey, setOpenaiApiKeyValue] = useState("")
  const [currentV0Key, setCurrentV0Key] = useState<string>()
  const [currentOpenAIKey, setCurrentOpenAIKey] = useState<string>()
  const [showV0Key, setShowV0Key] = useState(false)
  const [showOpenAIKey, setShowOpenAIKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingKeys, setLoadingKeys] = useState(true)

  useEffect(() => {
    loadKeys()
  }, [])

  const loadKeys = async () => {
    setLoadingKeys(true)
    try {
      const result = await getApiKeys()
      if (result.error) {
        toast.error(result.error)
      } else {
        setCurrentV0Key(result.v0ApiKey)
        setCurrentOpenAIKey(result.openAiApiKey)
      }
    } catch (error) {
      toast.error("Error al cargar las API keys")
    } finally {
      setLoadingKeys(false)
    }
  }

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!v0ApiKey.trim() && !openaiApiKey.trim()) {
      toast.error("Por favor ingresa al menos una API key")
      return
    }

    setLoading(true)
    try {
      const result = await saveApiKeys(
        v0ApiKey.trim() || undefined,
        openaiApiKey.trim() || undefined
      )

      if (result.success) {
        toast.success("API keys guardadas correctamente")
        setV0ApiKeyValue("")
        setOpenaiApiKeyValue("")
        await loadKeys()
      } else {
        toast.error(result.error || "Error al guardar las API keys")
      }
    } catch (error) {
      toast.error("Error al guardar las API keys")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveKeys = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar las API keys? Necesitarás configurarlas nuevamente.")) {
      setLoading(true)
      try {
        const result = await saveApiKeys(undefined, undefined)
        
        if (result.success) {
          toast.success("API keys eliminadas")
          await loadKeys()
        } else {
          toast.error(result.error || "Error al eliminar las API keys")
        }
      } catch (error) {
        toast.error("Error al eliminar las API keys")
      } finally {
        setLoading(false)
      }
    }
  }

  if (loadingKeys) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </CardTitle>
          <CardDescription>
            Configura tus claves de API de forma segura. Se guardan encriptadas en tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mostrar claves actuales */}
          {(currentV0Key || currentOpenAIKey) && (
            <div className="space-y-4 pb-4 border-b">
              <Label>Claves configuradas</Label>
              
              {currentV0Key && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">v0 API Key</Label>
                  <div className="flex gap-2">
                    <Input 
                      type={showV0Key ? "text" : "password"} 
                      value={currentV0Key} 
                      readOnly 
                      className="font-mono text-sm" 
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowV0Key(!showV0Key)}
                    >
                      {showV0Key ? "Ocultar" : "Mostrar"}
                    </Button>
                  </div>
                </div>
              )}

              {currentOpenAIKey && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">OpenAI API Key</Label>
                  <div className="flex gap-2">
                    <Input 
                      type={showOpenAIKey ? "text" : "password"} 
                      value={currentOpenAIKey} 
                      readOnly 
                      className="font-mono text-sm" 
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                    >
                      {showOpenAIKey ? "Ocultar" : "Mostrar"}
                    </Button>
                  </div>
                </div>
              )}

              <Button 
                type="button" 
                variant="destructive" 
                size="sm"
                onClick={handleRemoveKeys}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar todas las claves
              </Button>
            </div>
          )}

          {/* Formulario para actualizar/agregar claves */}
          <form onSubmit={handleSaveKeys} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="v0-api-key">
                {currentV0Key ? "Nueva v0 API Key (dejar vacío para mantener)" : "v0 API Key"}
              </Label>
              <Input
                id="v0-api-key"
                type="password"
                placeholder="v0_..."
                value={v0ApiKey}
                onChange={(e) => setV0ApiKeyValue(e.target.value)}
                autoComplete="off"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Obtén tu clave en <a href="https://v0.dev" target="_blank" rel="noopener noreferrer" className="underline">v0.dev</a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="openai-api-key">
                {currentOpenAIKey ? "Nueva OpenAI API Key (dejar vacío para mantener)" : "OpenAI API Key"}
              </Label>
              <Input
                id="openai-api-key"
                type="password"
                placeholder="sk-..."
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKeyValue(e.target.value)}
                autoComplete="off"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Obtén tu clave en <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com</a>
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  {currentV0Key || currentOpenAIKey ? "Actualizar API Keys" : "Guardar API Keys"}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
