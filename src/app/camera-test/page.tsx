'use client'

import { CameraPermissions } from '@/components/scanner/CameraPermissions'
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { toast } from 'sonner'

export default function CameraTestPage() {
  const [scannedCode, setScannedCode] = useState<string | null>(null)
  const [scannerActive, setScannerActive] = useState(false)

  const handleScanSuccess = (code: string) => {
    setScannedCode(code)
    setScannerActive(false)
    toast.success(`Código escaneado: ${code}`)
  }

  const handleScanError = (error: string) => {
    toast.error(error)
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Prueba de Cámara</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CameraPermissions />
        
        <Card>
          <CardHeader>
            <CardTitle>Prueba de Escaneo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!scannerActive ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Haz clic en el botón para probar el escáner
                </p>
                <button
                  onClick={() => setScannerActive(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Activar Escáner
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <BarcodeScanner
                  onScanSuccess={handleScanSuccess}
                  onError={handleScanError}
                  isActive={scannerActive}
                />
                <button
                  onClick={() => setScannerActive(false)}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Detener Escáner
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {scannedCode && (
        <Card>
          <CardHeader>
            <CardTitle>Último Código Escaneado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <p className="font-mono text-lg">{scannedCode}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información del Navegador</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Navegador:</span>
              <span>{navigator.userAgent.split(' ').pop()}</span>
            </div>
            <div className="flex justify-between">
              <span>HTTPS:</span>
              <span className={window.location.protocol === 'https:' ? 'text-green-600' : 'text-red-600'}>
                {window.location.protocol === 'https:' ? '✓ Sí' : '✗ No (requerido para cámara)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>MediaDevices API:</span>
              <span className={navigator.mediaDevices ? 'text-green-600' : 'text-red-600'}>
                {navigator.mediaDevices ? '✓ Disponible' : '✗ No disponible'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
