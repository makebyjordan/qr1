'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import QrScanner from 'qr-scanner'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'

interface DualScannerProps {
  onScanSuccess: (decodedText: string) => void
  onError?: (error: string) => void
}

export function DualScanner({ onScanSuccess, onError }: DualScannerProps) {
  const [isActive, setIsActive] = useState(false)
  const [lastScan, setLastScan] = useState<string | null>(null)
  const [scannerStatus, setScannerStatus] = useState<{
    qr: boolean
    barcode: boolean
  }>({ qr: false, barcode: false })
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)
  const barcodeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const scanningIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleScanResult = (code: string, type: 'QR' | 'Barcode') => {
    console.log(`${type} detected:`, code)
    setLastScan(code)
    toast.success(`${type} escaneado: ${code}`)
    onScanSuccess(code)
  }

  const testScan = () => {
    const testCode = '1234567890123'
    handleScanResult(testCode, 'QR')
  }

  const startCamera = async () => {
    try {
      console.log('Starting camera...')
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsActive(true)
        
        // Iniciar ambos escáneres
        await startQRScanner()
        await startBarcodeScanner()
        
        toast.success('🎥 Cámara activada! Escaneando QR y códigos de barras...')
      }
    } catch (error) {
      console.error('Camera error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error('Error al acceder a la cámara: ' + errorMessage)
      onError?.(errorMessage)
    }
  }

  const startQRScanner = async () => {
    if (!videoRef.current) return
    
    try {
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => handleScanResult(result.data, 'QR'),
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 10, // Aumentar frecuencia de escaneo
          preferredCamera: 'environment', // Cámara trasera preferida
        }
      )
      
      qrScannerRef.current = qrScanner
      await qrScanner.start()
      setScannerStatus(prev => ({ ...prev, qr: true }))
      console.log('QR Scanner started')
      
    } catch (error) {
      console.error('Error starting QR scanner:', error)
      setScannerStatus(prev => ({ ...prev, qr: false }))
    }
  }

  const startBarcodeScanner = async () => {
    if (!videoRef.current) return
    
    try {
      const codeReader = new BrowserMultiFormatReader()
      barcodeReaderRef.current = codeReader
      
      // Escaneo periódico para códigos de barras
      const scanBarcode = async () => {
        if (!videoRef.current || !barcodeReaderRef.current || !isActive) {
          console.log('Barcode scan skipped - missing requirements')
          return
        }
        
        try {
          console.log('Attempting barcode scan...')
          const result = await codeReader.decodeOnceFromVideoDevice(undefined, videoRef.current)
          console.log('Barcode scan successful:', result.getText())
          handleScanResult(result.getText(), 'Barcode')
        } catch (error) {
          // Ignorar errores de "no encontrado" pero log otros errores
          if (error instanceof NotFoundException) {
            // Silencioso para "no encontrado"
          } else {
            console.error('Barcode scanning error:', error)
          }
        }
      }
      
      // Escanear cada 300ms (más frecuente para mejor detección)
      scanningIntervalRef.current = setInterval(scanBarcode, 300)
      setScannerStatus(prev => ({ ...prev, barcode: true }))
      console.log('Barcode Scanner started')
      
    } catch (error) {
      console.error('Error starting barcode scanner:', error)
      setScannerStatus(prev => ({ ...prev, barcode: false }))
    }
  }

  const stopCamera = () => {
    // Detener QR Scanner
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      qrScannerRef.current.destroy()
      qrScannerRef.current = null
    }
    
    // Detener Barcode Scanner
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
    
    // Detener stream de cámara
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsActive(false)
    setScannerStatus({ qr: false, barcode: false })
    setLastScan(null)
    toast.info('📷 Cámara desactivada')
  }

  useEffect(() => {
    return () => {
      // Cleanup al desmontar
      if (qrScannerRef.current) {
        qrScannerRef.current.stop()
        qrScannerRef.current.destroy()
      }
      if (scanningIntervalRef.current) {
        clearInterval(scanningIntervalRef.current)
      }
      if (barcodeReaderRef.current) {
        try {
          barcodeReaderRef.current.reset()
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
            🚀 Activar Escáner Dual
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={testScan} variant="outline" size="sm">
              🧪 Prueba
            </Button>
            <Button onClick={stopCamera} variant="destructive">
              ⏹️ Detener Escáner
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
              <p className="text-sm text-gray-600">Escáner Dual Inactivo</p>
            </div>
          </div>
        )}
      </div>

      {isActive && (
        <Card className="p-4 text-center space-y-2">
          <p className="text-sm text-green-600 font-medium">
            ✅ Cámara activa - Escáner Dual funcionando
          </p>
          <div className="flex justify-center gap-4 text-xs">
            <span className={scannerStatus.qr ? 'text-green-600' : 'text-red-600'}>
              📱 QR: {scannerStatus.qr ? 'Activo' : 'Inactivo'}
            </span>
            <span className={scannerStatus.barcode ? 'text-green-600' : 'text-red-600'}>
              📊 Códigos de Barras: {scannerStatus.barcode ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Apunta la cámara hacia cualquier código QR o código de barras
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
            <span>Escáner QR:</span>
            <span className={scannerStatus.qr ? 'text-green-600' : 'text-gray-500'}>
              {scannerStatus.qr ? '📱 Funcionando' : '⚫ Inactivo'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Escáner Códigos de Barras:</span>
            <span className={scannerStatus.barcode ? 'text-green-600' : 'text-gray-500'}>
              {scannerStatus.barcode ? '📊 Funcionando' : '⚫ Inactivo'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
