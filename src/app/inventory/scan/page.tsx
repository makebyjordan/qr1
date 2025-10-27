'use client'

import { useState } from 'react'
import { ScannerModal } from '@/components/scanner/ScannerModal'
import { SimpleScanner } from '@/components/scanner/SimpleScanner'
import { BasicScanner } from '@/components/scanner/BasicScanner'
import { EnhancedScanner } from '@/components/scanner/EnhancedScanner'
import { DualScanner } from '@/components/scanner/DualScanner'
import { OptimizedScanner } from '@/components/scanner/OptimizedScanner'
import { ProductForm } from '@/components/forms/ProductForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QrCode, Package, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Product {
  id: string
  barcode: string
  title: string
  name: string
  currentStock: number
  minStock: number
  salePrice: number
}

export default function ScanPage() {
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [scannedBarcode, setScannedBarcode] = useState('')
  const [scannerType, setScannerType] = useState<'optimized' | 'dual' | 'basic' | 'simple'>('optimized') // Default to optimized scanner

  const handleScanSuccess = async (barcode: string) => {
    try {
      const response = await fetch(`/api/products/check?barcode=${encodeURIComponent(barcode)}`)
      const data = await response.json()

      if (data.exists && data.product) {
        setScannedProduct(data.product)
        setShowProductForm(false)
        toast.success('Producto encontrado')
      } else {
        setScannedBarcode(barcode)
        setScannedProduct(null)
        setShowProductForm(true)
        toast.info('Producto no encontrado. Crear nuevo producto.')
      }
    } catch (error) {
      toast.error('Error al verificar el producto')
      console.error('Error checking product:', error)
    }
  }

  const handleProductCreated = (product: Product) => {
    setScannedProduct(product)
    setShowProductForm(false)
    toast.success('Producto creado exitosamente')
  }

  const handleAddStock = async () => {
    if (!scannedProduct) return

    const quantity = prompt('¿Cuántas unidades deseas agregar?')
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      toast.error('Cantidad inválida')
      return
    }

    try {
      const response = await fetch('/api/stock/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barcode: scannedProduct.barcode,
          quantity: Number(quantity),
          notes: 'Entrada por escaneo',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al agregar stock')
      }

      setScannedProduct({
        ...scannedProduct,
        currentStock: data.newStock,
      })

      toast.success(`Stock actualizado. Nuevo stock: ${data.newStock}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al agregar stock')
    }
  }

  const resetScan = () => {
    setScannedProduct(null)
    setShowProductForm(false)
    setScannedBarcode('')
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Escanear Inventario</h1>
        <div className="flex gap-2">
          <Button 
            variant={scannerType === 'optimized' ? "default" : "outline"}
            onClick={() => setScannerType('optimized')}
          >
            ⚡ Optimizado
          </Button>
          <Button 
            variant={scannerType === 'dual' ? "default" : "outline"}
            onClick={() => setScannerType('dual')}
          >
            🚀 Dual
          </Button>
          <Button 
            variant={scannerType === 'basic' ? "default" : "outline"}
            onClick={() => setScannerType('basic')}
          >
            🎥 Básico
          </Button>
          <Button 
            variant={scannerType === 'simple' ? "default" : "outline"}
            onClick={() => setScannerType('simple')}
          >
            📱 Simple
          </Button>
        </div>
      </div>

      {scannedProduct && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Producto Encontrado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Código de Barras</p>
                <p className="font-mono">{scannedProduct.barcode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Título</p>
                <p className="font-semibold">{scannedProduct.title}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Nombre Completo</p>
                <p>{scannedProduct.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock Actual</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{scannedProduct.currentStock}</span>
                  <Badge 
                    variant={scannedProduct.currentStock <= scannedProduct.minStock ? 'destructive' : 'default'}
                  >
                    {scannedProduct.currentStock <= scannedProduct.minStock ? 'Stock Bajo' : 'Stock Normal'}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Precio de Venta</p>
                <p className="text-xl font-semibold">
                  ${Number(scannedProduct.salePrice).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddStock} className="flex-1">
                <Plus className="mr-2 h-4 w-4" />
                Agregar Stock
              </Button>
              <Button variant="outline" onClick={resetScan}>
                Escanear Otro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showProductForm && (
        <ProductForm
          initialData={{ barcode: scannedBarcode }}
          onSuccess={handleProductCreated}
          onCancel={() => setShowProductForm(false)}
        />
      )}

      {!scannedProduct && !showProductForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {scannerType === 'optimized' ? '⚡ Escáner Optimizado (ZXing Continuo)' :
               scannerType === 'dual' ? '🚀 Escáner Dual (QR + Códigos de Barras)' : 
               scannerType === 'basic' ? '🎥 Cámara Básica' : 
               '📱 Escáner Alternativo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scannerType === 'optimized' ? (
              <div className="space-y-4">
                <p className="text-muted-foreground text-center">
                  Escáner optimizado con ZXing para máxima detección de códigos QR y códigos de barras.
                </p>
                <OptimizedScanner 
                  onScanSuccess={handleScanSuccess}
                  onError={(error) => toast.error(error)}
                />
              </div>
            ) : scannerType === 'dual' ? (
              <div className="space-y-4">
                <p className="text-muted-foreground text-center">
                  Escáner dual: QR Scanner + ZXing funcionando simultáneamente para máxima compatibilidad.
                </p>
                <DualScanner 
                  onScanSuccess={handleScanSuccess}
                  onError={(error) => toast.error(error)}
                />
              </div>
            ) : scannerType === 'basic' ? (
              <div className="space-y-4">
                <p className="text-muted-foreground text-center">
                  Cámara básica con detección QR
                </p>
                <BasicScanner 
                  onScanSuccess={handleScanSuccess}
                  onError={(error) => toast.error(error)}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground text-center">
                  Escáner alternativo usando html5-qrcode
                </p>
                <SimpleScanner 
                  onScanSuccess={handleScanSuccess}
                  onError={(error) => toast.error(error)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        title="Escanear Producto"
      />
    </div>
  )
}
