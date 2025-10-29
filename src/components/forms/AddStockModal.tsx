'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Package } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

const addStockSchema = z.object({
  quantity: z.number().int().min(1, 'La cantidad debe ser mayor a 0'),
  unitPrice: z.number().min(0, 'El precio unitario debe ser mayor o igual a 0'),
  notes: z.string().optional(),
})

interface Product {
  id: string
  barcode: string
  title: string
  name: string
  description?: string
  costPrice: number
  salePrice: number
  taxRate: number
  currentStock: number
  minStock: number
  categoryId?: string
  supplierId?: string
  category?: { id: string; name: string }
  supplier?: { id: string; name: string }
  createdAt: string
}

interface AddStockModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedProduct: Product) => void
}

export function AddStockModal({ product, isOpen, onClose, onSuccess }: AddStockModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(0)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  // Initialize form when product changes
  useEffect(() => {
    if (product) {
      setQuantity(1)
      setUnitPrice(Number(product.costPrice))
      setNotes('')
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!product) return

    try {
      setLoading(true)

      // Validate data
      const validatedData = addStockSchema.parse({
        quantity,
        unitPrice,
        notes: notes.trim() || undefined,
      })

      const response = await fetch(`/api/products/${product.id}/stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Stock agregado exitosamente. Nuevo stock: ${data.product.currentStock}`)
        onSuccess(data.product)
        onClose()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al agregar stock')
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0]
        toast.error(firstError.message)
      } else {
        console.error('Error adding stock:', error)
        toast.error('Error al agregar stock')
      }
    } finally {
      setLoading(false)
    }
  }

  const totalValue = quantity * unitPrice
  const newStock = product ? product.currentStock + quantity : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Agregar Stock
          </DialogTitle>
        </DialogHeader>

        {product && (
          <div className="space-y-4">
            {/* Product Info */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4" />
                <h3 className="font-semibold">{product.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{product.name}</p>
              <p className="text-sm">Código: {product.barcode}</p>
              <p className="text-sm">Stock actual: <span className="font-medium">{product.currentStock}</span></p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad a agregar *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  required
                  placeholder="Ej: 10"
                />
              </div>

              {/* Unit Price */}
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Precio unitario de compra *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  min="0"
                  required
                  placeholder="Ej: 1.50"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Compra a proveedor ABC, factura #123"
                  rows={2}
                />
              </div>

              {/* Summary */}
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">Resumen</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Cantidad:</span>
                    <span className="font-medium">{quantity} unidades</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Precio unitario:</span>
                    <span className="font-medium">€{unitPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor total:</span>
                    <span className="font-medium">€{totalValue.toFixed(2)}</span>
                  </div>
                  <hr className="border-green-300" />
                  <div className="flex justify-between font-semibold text-green-800">
                    <span>Nuevo stock:</span>
                    <span>{newStock} unidades</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Agregando...' : 'Agregar Stock'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
