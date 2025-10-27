'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, CameraOff, AlertCircle, CheckCircle } from 'lucide-react'

export function CameraPermissions() {
  const [permissionState, setPermissionState] = useState<'checking' | 'granted' | 'denied' | 'prompt'>('checking')
  const [hasCamera, setHasCamera] = useState<boolean | null>(null)

  useEffect(() => {
    checkCameraAvailability()
    checkPermissionStatus()
  }, [])

  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      setHasCamera(videoDevices.length > 0)
    } catch (error) {
      console.error('Error checking camera availability:', error)
      setHasCamera(false)
    }
  }

  const checkPermissionStatus = async () => {
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName })
        setPermissionState(permission.state as any)
        
        permission.addEventListener('change', () => {
          setPermissionState(permission.state as any)
        })
      } else {
        setPermissionState('prompt')
      }
    } catch (error) {
      console.error('Error checking permissions:', error)
      setPermissionState('prompt')
    }
  }

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setPermissionState('granted')
    } catch (error) {
      console.error('Permission request failed:', error)
      setPermissionState('denied')
    }
  }

  const getStatusIcon = () => {
    switch (permissionState) {
      case 'granted':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'denied':
        return <CameraOff className="h-5 w-5 text-red-500" />
      case 'prompt':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Camera className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (permissionState) {
      case 'granted':
        return 'Permisos concedidos'
      case 'denied':
        return 'Permisos denegados'
      case 'prompt':
        return 'Permisos pendientes'
      default:
        return 'Verificando permisos...'
    }
  }

  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('chrome')) {
      return (
        <div className="text-sm space-y-1">
          <p className="font-medium">Chrome:</p>
          <p>1. Haz clic en el icono de candado en la barra de direcciones</p>
          <p>2. Selecciona "Cámara" → "Permitir"</p>
          <p>3. Recarga la página</p>
        </div>
      )
    } else if (userAgent.includes('firefox')) {
      return (
        <div className="text-sm space-y-1">
          <p className="font-medium">Firefox:</p>
          <p>1. Haz clic en el icono de escudo en la barra de direcciones</p>
          <p>2. Desactiva el bloqueo de cámara</p>
          <p>3. Recarga la página</p>
        </div>
      )
    } else if (userAgent.includes('safari')) {
      return (
        <div className="text-sm space-y-1">
          <p className="font-medium">Safari:</p>
          <p>1. Ve a Safari → Preferencias → Sitios web</p>
          <p>2. Selecciona "Cámara" en la barra lateral</p>
          <p>3. Cambia este sitio a "Permitir"</p>
        </div>
      )
    }
    
    return (
      <div className="text-sm">
        <p>Busca el icono de cámara en la barra de direcciones y permite el acceso.</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Estado de la Cámara
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Cámara disponible:</span>
          <span className={hasCamera ? 'text-green-600' : 'text-red-600'}>
            {hasCamera === null ? 'Verificando...' : hasCamera ? '✓ Sí' : '✗ No'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Permisos:</span>
          <span className={
            permissionState === 'granted' ? 'text-green-600' : 
            permissionState === 'denied' ? 'text-red-600' : 'text-yellow-600'
          }>
            {getStatusText()}
          </span>
        </div>

        {permissionState === 'denied' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <p>Los permisos de cámara están bloqueados. Para habilitarlos:</p>
                {getBrowserInstructions()}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {permissionState === 'prompt' && (
          <Button onClick={requestPermission} className="w-full">
            <Camera className="mr-2 h-4 w-4" />
            Solicitar permisos de cámara
          </Button>
        )}

        {permissionState === 'granted' && hasCamera && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              ¡Todo listo! Puedes comenzar a escanear códigos.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
