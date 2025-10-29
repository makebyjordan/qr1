'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import QrScanner from 'qr-scanner'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'

interface EnhancedScannerProps {
  onScanSuccess: (decodedText: string) => void
  onError?: (error: string) => void
}

export function EnhancedScanner({ onScanSuccess, onError }: EnhancedScannerProps) {
  const [isActive, setIsActive] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [lastScan, setLastScan] = useState<string | null>(null)
  const [scannerType, setScannerType] = useState<'qr' | 'barcode'>('qr')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)
  const barcodeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const scanningIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startCamera = async () => {
    try {
      console.log('Requesting camera access...')
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      })
      
      console.log('Camera access granted!')
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setHasPermission(true)
        setIsActive(true)
        
        // Iniciar con escáner QR
        startQRScanning()
        
        toast.success('🎥 Cámara activada! Escaneando códigos...')
      }
    } catch (error) {
      console.error('Camera error:', error)
      setHasPermission(false)
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      if (errorMessage.includes('NotAllowedError')) {
        toast.error('Permisos de cámara denegados.')
        onError?.('Permisos de cámara denegados')
      } else {
        toast.error('Error al acceder a la cámara: ' + errorMessage)
        onError?.(errorMessage)
      }
    }
  }

  const startQRScanning = () => {
    if (!videoRef.current) return
    
    try {
      // Detener escáner de códigos de barras si está activo
      stopBarcodeScanning()
      
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result.data)
          handleScanResult(result.data)
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      )
      
      qrScannerRef.current = qrScanner
      qrScanner.start()
      setScannerType('qr')
      setIsScanning(true)
      
    } catch (error) {
      console.error('Error starting QR scanner:', error)
    }
  }

  const startBarcodeScanning = async () => {
    if (!videoRef.current) return
    
    try {
      // Detener escáner QR si está activo
      stopQRScanning()
      
      const codeReader = new BrowserMultiFormatReader()
      barcodeReaderRef.current = codeReader
      
      console.log('Starting barcode scanner...')
      
      // Usar decodeFromVideoDevice para escaneo continuo
      try {
        await codeReader.decodeFromVideoDevice(
          null, // deviceId (null = default camera)
          videoRef.current,
          (result, error) => {
            if (result) {
              console.log('Barcode detected:', result.getText())
              handleScanResult(result.getText())
            }
            // Ignorar errores de "no encontrado"
            if (error && !(error instanceof NotFoundException)) {
              console.error('Barcode scanning error:', error)
            }
          }
        )
        
        setScannerType('barcode')
        setIsScanning(true)
        console.log('Barcode scanner started successfully')
        
      } catch (error) {
        console.error('Error in decodeFromVideoDevice:', error)
        toast.error('Error al iniciar escáner de códigos de barras')
      }
      
    } catch (error) {
      console.error('Error starting barcode scanner:', error)
      toast.error('Error al configurar escáner de códigos de barras')
    }
  }

  const stopQRScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      qrScannerRef.current.destroy()
      qrScannerRef.current = null
    }
  }

  const stopBarcodeScanning = () => {
    if (scanningIntervalRef.current) {
      clearInterval(scanningIntervalRef.current)
      scanningIntervalRef.current = null
    }
    if (barcodeReaderRef.current) {
      try {
        barcodeReaderRef.current.reset()
      } catch (error) {
        console.log('Error resetting barcode reader:', error)
      }
      barcodeReaderRef.current = null
    }
  }

  const handleScanResult = (code: string) => {
    setLastScan(code)
    toast.success(`Código escaneado: ${code}`)
    onScanSuccess(code)
  }

  const stopCamera = () => {
    // Detener ambos escáneres
    stopQRScanning()
    stopBarcodeScanning()
    
    // Detener el stream de la cámara
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsActive(false)
    setIsScanning(false)
    setHasPermission(null)
    setLastScan(null)
    toast.info('📷 Cámara desactivada')
  }

  const switchScannerType = () => {
    if (scannerType === 'qr') {
      startBarcodeScanning()
      toast.info('📊 Cambiado a escáner de códigos de barras')
    } else {
      startQRScanning()
      toast.info('📱 Cambiado a escáner QR')
    }
  }

  useEffect(() => {
    return () => {
      stopQRScanning()
      stopBarcodeScanning()
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
            🎥 Activar Cámara y Escáner
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={switchScannerType} variant="outline">
              {scannerType === 'qr' ? '📊 Cambiar a Códigos de Barras' : '📱 Cambiar a QR'}
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
              <p className="text-gray-500 mb-2">📷</p>
              <p className="text-sm text-gray-600">Cámara inactiva</p>
            </div>
          </div>
        )}
      </div>

      {isActive && (
        <Card className="p-4 text-center space-y-2">
          <p className="text-sm text-green-600 font-medium">
            ✅ Cámara activa {isScanning && (scannerType === 'qr' ? '📱 Escáner QR' : '📊 Escáner Códigos de Barras')}
          </p>
          <p className="text-xs text-muted-foreground">
            Apunta la cámara hacia un {scannerType === 'qr' ? 'código QR' : 'código de barras'}
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
            <span>Escáner:</span>
            <span className={isScanning ? 'text-green-600' : 'text-gray-500'}>
              {isScanning ? (scannerType === 'qr' ? '📱 QR Activo' : '📊 Códigos de Barras Activo') : '⚫ Inactivo'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
