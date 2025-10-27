'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { BrowserMultiFormatReader, NotFoundException, Result } from '@zxing/library'

interface OptimizedScannerProps {
  onScanSuccess: (decodedText: string) => void
  onError?: (error: string) => void
}

export function OptimizedScanner({ onScanSuccess, onError }: OptimizedScannerProps) {
  const [isActive, setIsActive] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [lastScan, setLastScan] = useState<string | null>(null)
  const [scanCount, setScanCount] = useState(0)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const isProcessingRef = useRef(false)

  const handleScanResult = (code: string) => {
    if (isProcessingRef.current) return // Evitar duplicados
    
    isProcessingRef.current = true
    console.log('Code detected:', code)
    setLastScan(code)
    setScanCount(prev => prev + 1)
    toast.success(`Código escaneado: ${code}`)
    onScanSuccess(code)
    
    // Reset después de 2 segundos para permitir nuevos escaneos
    setTimeout(() => {
      isProcessingRef.current = false
    }, 2000)
  }

  const startCamera = async () => {
    try {
      console.log('Starting optimized scanner...')
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        } 
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsActive(true)
        
        // Iniciar escáner ZXing optimizado
        await startZXingScanner()
        
        toast.success('🚀 Escáner optimizado activado!')
      }
    } catch (error) {
      console.error('Camera error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error('Error al acceder a la cámara: ' + errorMessage)
      onError?.(errorMessage)
    }
  }

  const startZXingScanner = async () => {
    if (!videoRef.current) return
    
    try {
      const codeReader = new BrowserMultiFormatReader()
      readerRef.current = codeReader
      
      console.log('Starting ZXing continuous scan...')
      
      // Usar decodeFromVideoDevice para escaneo continuo
      await codeReader.decodeFromVideoDevice(
        null, // deviceId
        videoRef.current,
        (result: Result | null, error?: Error) => {
          if (result) {
            handleScanResult(result.getText())
          }
          // Solo log errores que no sean "not found"
          if (error && !(error instanceof NotFoundException)) {
            console.error('Scan error:', error)
          }
        }
      )
      
      setIsScanning(true)
      console.log('ZXing scanner started successfully')
      
    } catch (error) {
      console.error('Error starting ZXing scanner:', error)
      toast.error('Error al iniciar el escáner')
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    // Detener escáner
    if (readerRef.current) {
      try {
        readerRef.current.reset()
      } catch (error) {
        console.log('Error resetting reader:', error)
      }
      readerRef.current = null
    }
    
    // Detener stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsActive(false)
    setIsScanning(false)
    setLastScan(null)
    setScanCount(0)
    isProcessingRef.current = false
    toast.info('📷 Escáner desactivado')
  }

  const testScan = () => {
    const testCode = '1234567890123'
    handleScanResult(testCode)
  }

  useEffect(() => {
    return () => {
      // Cleanup
      if (readerRef.current) {
        try {
          readerRef.current.reset()
        } catch (error) {
          console.log('Cleanup error:', error)
        }
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
            🚀 Activar Escáner Optimizado
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={testScan} variant="outline" size="sm">
              🧪 Prueba ({scanCount})
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
        
        {!isActive && (
          <div className="w-full max-w-md mx-auto h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-2">🚀</p>
              <p className="text-sm text-gray-600">Escáner Optimizado Inactivo</p>
            </div>
          </div>
        )}
      </div>

      {isActive && (
        <Card className="p-4 text-center space-y-2">
          <p className="text-sm text-green-600 font-medium">
            ✅ Escáner Optimizado {isScanning ? '🔍 Escaneando...' : '⏸️ Pausado'}
          </p>
          <p className="text-xs text-muted-foreground">
            Apunta la cámara hacia cualquier código QR o código de barras
          </p>
          <p className="text-xs text-blue-600">
            Escaneos realizados: {scanCount}
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
            <span>Cámara:</span>
            <span className={isActive ? 'text-green-600' : 'text-gray-500'}>
              {isActive ? '🟢 Activa' : '⚫ Inactiva'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Escáner:</span>
            <span className={isScanning ? 'text-green-600' : 'text-gray-500'}>
              {isScanning ? '🔍 Escaneando' : '⚫ Inactivo'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Códigos detectados:</span>
            <span className="text-blue-600">{scanCount}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
