'use client'

import { useState } from 'react'
import { ScannerModal } from '@/components/scanner/ScannerModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QrCode, ShoppingCart, Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils/currency'
import { calculateSaleAmounts } from '@/lib/utils/calculations'

interface Product {
  id: string
  barcode: string
  title: string
  name: string
  currentStock: number
  salePrice: number
  taxRate: number
}

export default function SalesPage() {
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleScanSuccess = async (barcode: string) => {
    try {
      const response = await fetch(`/api/products/check?barcode=${encodeURIComponent(barcode)}`)
      const data = await response.json()

      if (data.exists && data.product) {
        setScannedProduct(data.product)
        setQuantity(1)
        toast.success('Producto encontrado')
      } else {
        toast.error('Producto no encontrado')
      }
    } catch (error) {
      toast.error('Error al verificar el producto')
      console.error('Error checking product:', error)
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return
    if (scannedProduct && newQuantity > scannedProduct.currentStock) {
      toast.error('Cantidad excede el stock disponible')
      return
    }
    setQuantity(newQuantity)
  }

  const handleProcessSale = async () => {
    if (!scannedProduct) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barcode: scannedProduct.barcode,
          quantity,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar la venta')
      }

      toast.success('Venta procesada exitosamente')
      setScannedProduct(null)
      setQuantity(1)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al procesar la venta')
    } finally {
      setIsProcessing(false)
    }
  }

  const saleAmounts = scannedProduct 
    ? calculateSaleAmounts(quantity, Number(scannedProduct.salePrice), Number(scannedProduct.taxRate))
    : null

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Punto de Venta</h1>
        <Button onClick={() => setIsScannerOpen(true)}>
          <QrCode className="mr-2 h-4 w-4" />
          Escanear Producto
        </Button>
      </div>

      {scannedProduct ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Producto Seleccionado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Código de Barras</p>
                <p className="font-mono">{scannedProduct.barcode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Producto</p>
                <p className="font-semibold">{scannedProduct.title}</p>
                <p className="text-sm text-muted-foreground">{scannedProduct.name}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Stock Disponible</p>
                  <p className="text-lg font-semibold">{scannedProduct.currentStock} unidades</p>
                </div>
                <Badge 
                  variant={scannedProduct.currentStock > 10 ? 'default' : 'destructive'}
                >
                  {scannedProduct.currentStock > 10 ? 'Disponible' : 'Stock Bajo'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Precio Unitario</p>
                <p className="text-xl font-bold">{formatCurrency(Number(scannedProduct.salePrice))}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles de Venta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="quantity">Cantidad</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                    className="text-center"
                    min="1"
                    max={scannedProduct.currentStock}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= scannedProduct.currentStock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {saleAmounts && (
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(saleAmounts.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA ({scannedProduct.taxRate}%):</span>
                    <span>{formatCurrency(saleAmounts.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(saleAmounts.total)}</span>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleProcessSale} 
                disabled={isProcessing || quantity > scannedProduct.currentStock}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {isProcessing ? 'Procesando...' : 'Procesar Venta'}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Escanea un producto para vender</h3>
            <p className="text-muted-foreground text-center mb-6">
              Usa el escáner para seleccionar el producto que deseas vender
            </p>
            <Button onClick={() => setIsScannerOpen(true)} size="lg">
              <QrCode className="mr-2 h-5 w-5" />
              Escanear Producto
            </Button>
          </CardContent>
        </Card>
      )}

      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        title="Escanear para Venta"
      />
    </div>
  )
}
