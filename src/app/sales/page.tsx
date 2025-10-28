'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Camera, ShoppingCart, Package, Minus, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { BrowserMultiFormatReader } from '@zxing/library'

interface Product {
  id: string
  barcode: string
  title: string
  name: string
  description?: string
  salePrice: number
  currentStock: number
  category?: { id: string; name: string }
  supplier?: { id: string; name: string }
}

interface SaleItem {
  product: Product
  quantity: number
  subtotal: number
}

export default function SalesPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [loading, setLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)

  const total = saleItems.reduce((sum, item) => sum + item.subtotal, 0)

  useEffect(() => {
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset()
      }
    }
  }, [])

  const startScanning = async () => {
    try {
      setIsScanning(true)
      const codeReader = new BrowserMultiFormatReader()
      codeReaderRef.current = codeReader

      const videoInputDevices = await codeReader.listVideoInputDevices()
      if (videoInputDevices.length === 0) {
        toast.error('No se encontró cámara')
        setIsScanning(false)
        return
      }

      const selectedDeviceId = videoInputDevices[0].deviceId

      codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current!, (result) => {
        if (result) {
          const barcode = result.getText()
          handleBarcodeDetected(barcode)
          stopScanning()
        }
      })
    } catch (error) {
      console.error('Error starting camera:', error)
      toast.error('Error al acceder a la cámara')
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset()
    }
    setIsScanning(false)
  }

  const handleBarcodeDetected = async (barcode: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/check?barcode=${barcode}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.exists) {
          setScannedProduct(data.product)
          setQuantity(1)
          toast.success(`Producto encontrado: ${data.product.title}`)
        } else {
          toast.error('Producto no encontrado en el inventario')
        }
      } else {
        toast.error('Error al buscar el producto')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Error al buscar el producto')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToSale = () => {
    if (!scannedProduct) return

    if (quantity > scannedProduct.currentStock) {
      toast.error(`Stock insuficiente. Disponible: ${scannedProduct.currentStock}`)
      return
    }

    const existingItemIndex = saleItems.findIndex(item => item.product.id === scannedProduct.id)
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const newItems = [...saleItems]
      const newQuantity = newItems[existingItemIndex].quantity + quantity
      
      if (newQuantity > scannedProduct.currentStock) {
        toast.error(`Stock insuficiente. Disponible: ${scannedProduct.currentStock}`)
        return
      }
      
      newItems[existingItemIndex].quantity = newQuantity
      newItems[existingItemIndex].subtotal = newQuantity * Number(scannedProduct.salePrice)
      setSaleItems(newItems)
    } else {
      // Add new item
      const newItem: SaleItem = {
        product: scannedProduct,
        quantity: quantity,
        subtotal: quantity * Number(scannedProduct.salePrice)
      }
      setSaleItems([...saleItems, newItem])
    }

    setScannedProduct(null)
    setQuantity(1)
    toast.success('Producto agregado a la venta')
  }

  const handleRemoveItem = (productId: string) => {
    setSaleItems(saleItems.filter(item => item.product.id !== productId))
    toast.success('Producto eliminado de la venta')
  }

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId)
      return
    }

    const newItems = saleItems.map(item => {
      if (item.product.id === productId) {
        if (newQuantity > item.product.currentStock) {
          toast.error(`Stock insuficiente. Disponible: ${item.product.currentStock}`)
          return item
        }
        return {
          ...item,
          quantity: newQuantity,
          subtotal: newQuantity * Number(item.product.salePrice)
        }
      }
      return item
    })
    setSaleItems(newItems)
  }

  const handleCompleteSale = async () => {
    if (saleItems.length === 0) {
      toast.error('No hay productos en la venta')
      return
    }

    try {
      setLoading(true)
      
      // Process each item to update stock
      for (const item of saleItems) {
        const response = await fetch(`/api/products/${item.product.id}/sell`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quantity: item.quantity,
            salePrice: Number(item.product.salePrice)
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          toast.error(`Error vendiendo ${item.product.title}: ${error.error}`)
          return
        }
      }

      toast.success(`Venta completada. Total: €${total.toFixed(2)}`)
      setSaleItems([])
    } catch (error) {
      console.error('Error completing sale:', error)
      toast.error('Error al completar la venta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sistema de Ventas</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          Total: €{total.toFixed(2)}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Scanner Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Escanear Producto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isScanning ? (
              <Button onClick={startScanning} className="w-full" size="lg">
                <Camera className="mr-2 h-5 w-5" />
                Iniciar Escáner
              </Button>
            ) : (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  className="w-full h-64 bg-black rounded-lg"
                  autoPlay
                  playsInline
                />
                <Button onClick={stopScanning} variant="outline" className="w-full">
                  Detener Escáner
                </Button>
              </div>
            )}

            {loading && (
              <div className="text-center py-4">
                <p>Buscando producto...</p>
              </div>
            )}

            {scannedProduct && (
              <div className="space-y-4 p-4 border rounded-lg bg-green-50">
                <div>
                  <h3 className="font-semibold">{scannedProduct.title}</h3>
                  <p className="text-sm text-muted-foreground">{scannedProduct.name}</p>
                  <p className="text-sm">Código: {scannedProduct.barcode}</p>
                  <p className="text-sm">Stock disponible: {scannedProduct.currentStock}</p>
                  <p className="text-lg font-bold text-green-600">€{Number(scannedProduct.salePrice).toFixed(2)}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad a vender</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center"
                      min="1"
                      max={scannedProduct.currentStock}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQuantity(Math.min(scannedProduct.currentStock, quantity + 1))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Subtotal: €{(quantity * Number(scannedProduct.salePrice)).toFixed(2)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddToSale} className="flex-1">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Agregar a Venta
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setScannedProduct(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sale Items Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Productos en Venta ({saleItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {saleItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="mx-auto h-12 w-12 mb-4" />
                <p>No hay productos en la venta</p>
                <p className="text-sm">Escanea un código para comenzar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {saleItems.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        €{Number(item.product.salePrice).toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="font-bold">€{item.subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-green-600">€{total.toFixed(2)}</span>
                  </div>
                  <Button
                    onClick={handleCompleteSale}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? 'Procesando...' : 'Completar Venta'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
