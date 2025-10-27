'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import QrScanner from 'qr-scanner'

interface BasicScannerProps {
  onScanSuccess: (decodedText: string) => void
  onError?: (error: string) => void
}

export function BasicScanner({ onScanSuccess, onError }: BasicScannerProps) {
  const [isActive, setIsActive] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [lastScan, setLastScan] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)

  const startCamera = async () => {
    try {
      console.log('Requesting camera access...')
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Cámara trasera preferida
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      })
      
      console.log('Camera access granted!')
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setHasPermission(true)
        setIsActive(true)
        
        // Inicializar el escáner QR
        const qrScanner = new QrScanner(
          videoRef.current,
          (result) => {
            console.log('QR Code detected:', result.data)
            setLastScan(result.data)
            toast.success(`Código escaneado: ${result.data}`)
            onScanSuccess(result.data)
            
            // Opcional: detener el escáner después de un escaneo exitoso
            // stopScanning()
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        )
        
        qrScannerRef.current = qrScanner
        qrScanner.start()
        setIsScanning(true)
        
        toast.success('🎥 Cámara activada! 📱 Escáner QR iniciado')
      }
    } catch (error) {
      console.error('Camera error:', error)
      setHasPermission(false)
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      if (errorMessage.includes('NotAllowedError')) {
        toast.error('Permisos de cámara denegados. Permite el acceso en tu navegador.')
        onError?.('Permisos de cámara denegados')
      } else if (errorMessage.includes('NotFoundError')) {
        toast.error('No se encontró cámara en este dispositivo')
        onError?.('No se encontró cámara')
      } else {
        toast.error('Error al acceder a la cámara: ' + errorMessage)
        onError?.(errorMessage)
      }
    }
  }

  const stopCamera = () => {
    // Detener el escáner QR
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      qrScannerRef.current.destroy()
      qrScannerRef.current = null
      setIsScanning(false)
    }
    
    // Detener el stream de la cámara
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsActive(false)
    setHasPermission(null)
    setLastScan(null)
    toast.info('📷 Cámara y escáner desactivados')
  }

  // Función simple para capturar imagen (para futuras mejoras)
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        // Aquí podrías integrar una librería de detección de QR más simple
        toast.info('Imagen capturada (función de escaneo pendiente)')
      }
    }
  }

  useEffect(() => {
    return () => {
      // Cleanup al desmontar el componente
      if (qrScannerRef.current) {
        qrScannerRef.current.stop()
        qrScannerRef.current.destroy()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-center gap-2">
        {!isActive ? (
          <Button onClick={startCamera} size="lg">
            🎥 Activar Cámara
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={captureImage} variant="outline">
              📸 Capturar
            </Button>
            <Button onClick={stopCamera} variant="destructive">
              ⏹️ Detener
            </Button>
          </div>
        )}
      </div>

      <div className="relative">
        <video
          ref={videoRef}
          className="w-full max-w-md mx-auto rounded-lg border"
          style={{ display: isActive ? 'block' : 'none' }}
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="hidden"
        />
        
        {!isActive && (
          <div className="w-full max-w-md mx-auto h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-2">📷</p>
              <p className="text-sm text-gray-600">Cámara inactiva</p>
            </div>
          </div>
        )}
      </div>

      {isActive && (
        <Card className="p-4 text-center space-y-2">
          <p className="text-sm text-green-600 font-medium">
            ✅ Cámara activa {isScanning && '📱 Escáner QR activo'}
          </p>
          <p className="text-xs text-muted-foreground">
            Apunta la cámara hacia un código QR o código de barras
          </p>
          {lastScan && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
              <p className="text-xs text-green-700 font-medium">Último escaneo:</p>
              <p className="text-sm font-mono text-green-800 break-all">{lastScan}</p>
            </div>
          )}
        </Card>
      )}

      <Card className="p-3">
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span>Estado de permisos:</span>
            <span className={
              hasPermission === true ? 'text-green-600' : 
              hasPermission === false ? 'text-red-600' : 'text-gray-500'
            }>
              {hasPermission === true ? '✅ Concedidos' : 
               hasPermission === false ? '❌ Denegados' : '⏳ Pendiente'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Cámara:</span>
            <span className={isActive ? 'text-green-600' : 'text-gray-500'}>
              {isActive ? '🟢 Activa' : '⚫ Inactiva'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Escáner QR:</span>
            <span className={isScanning ? 'text-green-600' : 'text-gray-500'}>
              {isScanning ? '📱 Escaneando' : '⚫ Inactivo'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
