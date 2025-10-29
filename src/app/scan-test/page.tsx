'use client'

import { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function ScanTestPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  const startScanning = () => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    }

    const scanner = new Html5QrcodeScanner('qr-reader-test', config, false)
    scannerRef.current = scanner

    const onScanSuccess = (decodedText: string) => {
      console.log('Scan success:', decodedText)
      setScannedCode(decodedText)
      setIsScanning(false)
      toast.success(`Código escaneado: ${decodedText}`)
      scanner.clear()
    }

    const onScanFailure = (error: string) => {
      // Solo log errores importantes, no cada frame
      if (!error.includes('NotFoundException')) {
        console.log('Scan error:', error)
      }
    }

    try {
      scanner.render(onScanSuccess, onScanFailure)
      setIsScanning(true)
      toast.info('Escáner iniciado. Apunta la cámara hacia un código.')
    } catch (error) {
      console.error('Error starting scanner:', error)
      toast.error('Error al iniciar el escáner')
    }
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
      setIsScanning(false)
      toast.info('Escáner detenido')
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
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Prueba de Escáner Directo</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Controles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isScanning ? (
              <Button onClick={startScanning} className="w-full">
                Iniciar Escáner
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="destructive" className="w-full">
                Detener Escáner
              </Button>
            )}
            
            <div className="text-sm text-muted-foreground">
              <p>• Asegúrate de que tienes permisos de cámara</p>
              <p>• El escáner aparecerá abajo cuando esté listo</p>
              <p>• Apunta la cámara hacia un código QR o de barras</p>
            </div>
          </CardContent>
        </Card>

        {scannedCode && (
          <Card>
            <CardHeader>
              <CardTitle>Último Código Escaneado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="font-mono text-lg break-all">{scannedCode}</p>
              </div>
              <Button 
                onClick={() => setScannedCode(null)} 
                variant="outline" 
                className="mt-2"
              >
                Limpiar
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Escáner</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="qr-reader-test" className="w-full"></div>
          {isScanning && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Escáner activo - apunta la cámara hacia el código
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
