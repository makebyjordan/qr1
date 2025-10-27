'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Camera, CameraOff } from 'lucide-react'

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void
  onError?: (error: string) => void
  isActive?: boolean
}

export function BarcodeScanner({ onScanSuccess, onError, isActive = true }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const elementRef = useRef<HTMLDivElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isRequestingPermission, setIsRequestingPermission] = useState(false)

  useEffect(() => {
    if (!isActive) return

    // Wait for DOM element to be available
    const initializeScanner = () => {
      if (!elementRef.current || isInitialized) {
        return
      }

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
        // Generate unique ID for this scanner instance
        const scannerId = `qr-reader-${Date.now()}`
        elementRef.current.id = scannerId
        
        console.log('Initializing scanner with ID:', scannerId)
        const scanner = new Html5QrcodeScanner(scannerId, config, false)
        scannerRef.current = scanner
        setIsInitialized(true)
        console.log('Scanner initialized')

        const onScanSuccessCallback = (decodedText: string) => {
          setIsScanning(false)
          onScanSuccess(decodedText)
          if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error)
          }
        }

        const onScanFailureCallback = (error: string) => {
          // Don't log every scan failure, only actual errors
          if (error.includes('NotFoundException')) return
          onError?.(error)
        }

        // Set timeout to avoid hanging
        const permissionTimeout = setTimeout(() => {
          if (hasPermission === null) {
            setHasPermission(false)
            onError?.('Tiempo de espera agotado. Haz clic en "Permitir acceso" para solicitar permisos manualmente.')
          }
        }, 5000)

        // Check camera permissions first
        const requestPermissions = async () => {
          try {
            setIsRequestingPermission(true)
            
            clearTimeout(permissionTimeout)
            setHasPermission(true)
            setIsRequestingPermission(false)
            
            if (scannerRef.current) {
              console.log('Rendering scanner...')
              scannerRef.current.render(onScanSuccessCallback, onScanFailureCallback)
              setIsScanning(true)
              console.log('Scanner rendered successfully')
            }
          } catch (error) {
            clearTimeout(permissionTimeout)
            setIsRequestingPermission(false)
            console.error('Camera permission error:', error)
            setHasPermission(false)
            
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            if (errorMessage.includes('NotAllowedError') || errorMessage.includes('Permission denied')) {
              onError?.('Permisos de cámara denegados. Haz clic en "Permitir acceso" para intentar de nuevo.')
            } else if (errorMessage.includes('NotFoundError')) {
              onError?.('No se encontró ninguna cámara en este dispositivo.')
            } else {
              onError?.('Error al acceder a la cámara. Verifica que no esté siendo usada por otra aplicación.')
            }
          }
        }

        requestPermissions()
      } catch (error) {
        console.error('Error initializing scanner:', error)
        onError?.('Error al inicializar el escáner.')
      }
    }

    // Use a small delay to ensure DOM is ready
    const timeoutId = setTimeout(initializeScanner, 100)

    return () => {
      clearTimeout(timeoutId)
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
        scannerRef.current = null
      }
      setIsInitialized(false)
      setIsScanning(false)
    }
  }, [isActive, onScanSuccess, onError])

  const requestCameraPermission = async () => {
    try {
      setIsRequestingPermission(true)
      
      setHasPermission(true)
      setIsRequestingPermission(false)
      
      // Reinitialize the scanner
      if (elementRef.current && !isInitialized) {
        const scannerId = `qr-reader-${Date.now()}`
        elementRef.current.id = scannerId
        
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          supportedScanTypes: [0, 1], // QR Code y EAN-13
        }
        
        const scanner = new Html5QrcodeScanner(scannerId, config, false)
        scannerRef.current = scanner
        setIsInitialized(true)
        
        const onScanSuccessCallback = (decodedText: string) => {
          setIsScanning(false)
          onScanSuccess(decodedText)
          if (scannerRef.current) {
            scannerRef.current.clear().catch(console.error)
          }
        }
        
        const onScanFailureCallback = (error: string) => {
          if (error.includes('NotFoundException')) return
          onError?.(error)
        }
        
        scanner.render(onScanSuccessCallback, onScanFailureCallback)
        setIsScanning(true)
      }
    } catch (error) {
      setIsRequestingPermission(false)
      console.error('Manual permission request failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      
      if (errorMessage.includes('NotAllowedError')) {
        onError?.('Permisos denegados. Ve a la configuración del navegador y permite el acceso a la cámara para este sitio.')
      } else if (errorMessage.includes('NotFoundError')) {
        onError?.('No se encontró cámara. Verifica que tu dispositivo tenga una cámara conectada.')
      } else {
        onError?.('Error al acceder a la cámara. Intenta recargar la página.')
      }
    }
  }

  if (hasPermission === false) {
    return (
      <Card className="p-6 text-center">
        <CameraOff className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Acceso a la cámara requerido</h3>
        <div className="text-muted-foreground mb-4 space-y-2">
          <p>Para escanear códigos de barras, necesitamos acceso a tu cámara.</p>
          <div className="text-sm">
            <p className="font-medium">Instrucciones:</p>
            <ul className="text-left mt-2 space-y-1">
              <li>• Haz clic en "Permitir" cuando aparezca la solicitud</li>
              <li>• Si no aparece, revisa el icono de cámara en la barra de direcciones</li>
              <li>• En Chrome: haz clic en el icono de candado → Cámara → Permitir</li>
            </ul>
          </div>
        </div>
        <Button onClick={requestCameraPermission} disabled={isRequestingPermission}>
          <Camera className="mr-2 h-4 w-4" />
          {isRequestingPermission ? 'Solicitando permisos...' : 'Permitir acceso a la cámara'}
        </Button>
      </Card>
    )
  }

  if (hasPermission === null) {
    return (
      <Card className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="mb-4">Verificando permisos de cámara...</p>
        <p className="text-sm text-muted-foreground mb-4">
          Si no aparece la solicitud de permisos, haz clic en el botón de abajo
        </p>
        <Button 
          variant="outline" 
          onClick={requestCameraPermission}
          disabled={isRequestingPermission}
        >
          <Camera className="mr-2 h-4 w-4" />
          {isRequestingPermission ? 'Solicitando...' : 'Solicitar permisos manualmente'}
        </Button>
      </Card>
    )
  }

  return (
    <div className="w-full">
      <div ref={elementRef} className="w-full min-h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
        {!isScanning && hasPermission === true && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Iniciando cámara...</p>
          </div>
        )}
      </div>
      {isScanning && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Apunta la cámara hacia el código de barras o QR
          </p>
        </div>
      )}
    </div>
  )
}
