'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface SimpleScannerProps {
  onScanSuccess: (decodedText: string) => void
  onError?: (error: string) => void
}

export function SimpleScanner({ onScanSuccess, onError }: SimpleScannerProps) {
  const [isActive, setIsActive] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  const startScanner = () => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      supportedScanTypes: [
        0, // QR Code
        1, // EAN-13 (códigos de barras más comunes)
      ],
    }

    try {
      const scanner = new Html5QrcodeScanner('simple-qr-reader', config, false)
      scannerRef.current = scanner

      const onScanSuccessCallback = (decodedText: string) => {
        console.log('Scan success:', decodedText)
        setIsScanning(false)
        setIsActive(false)
        onScanSuccess(decodedText)
        scanner.clear()
      }

      const onScanFailureCallback = (error: string) => {
        // Solo log errores importantes
        if (!error.includes('NotFoundException')) {
          console.log('Scan error:', error)
        }
      }

      scanner.render(onScanSuccessCallback, onScanFailureCallback)
      setIsScanning(true)
      setIsActive(true)
    } catch (error) {
      console.error('Error starting scanner:', error)
      onError?.('Error al iniciar el escáner')
    }
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
      setIsScanning(false)
      setIsActive(false)
    }
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear()
      }
    }
  }, [])

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-center gap-2">
        {!isActive ? (
          <Button onClick={startScanner}>
            Iniciar Escáner
          </Button>
        ) : (
          <Button onClick={stopScanner} variant="destructive">
            Detener Escáner
          </Button>
        )}
      </div>

      <div id="simple-qr-reader" className="w-full"></div>

      {isScanning && (
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            ✅ Escáner activo - Apunta la cámara hacia el código
          </p>
        </Card>
      )}
    </div>
  )
}
