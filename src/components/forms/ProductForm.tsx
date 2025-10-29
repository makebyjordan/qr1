'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductFormData } from '@/lib/validations/product'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface ProductFormProps {
  initialData?: Partial<ProductFormData>
  onSuccess?: (product: any) => void
  onCancel?: () => void
}

export function ProductForm({ initialData, onSuccess, onCancel }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      barcode: initialData?.barcode || '',
      title: initialData?.title || '',
      name: initialData?.name || '',
      costPrice: initialData?.costPrice || 0,
      salePrice: initialData?.salePrice || 0,
      taxRate: initialData?.taxRate || 16,
      currentStock: initialData?.currentStock || 0,
      minStock: initialData?.minStock || 10,
    },
  })

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear el producto')
      }

      toast.success('Producto creado exitosamente')
      reset()
      onSuccess?.(result.product)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear el producto')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Nuevo Producto</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Código de Barras *</Label>
              <Input
                id="barcode"
                {...register('barcode')}
                placeholder="Código de barras"
                disabled={!!initialData?.barcode}
              />
              {errors.barcode && (
                <p className="text-sm text-red-600">{errors.barcode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Título corto del producto"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Nombre descriptivo completo"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPrice">Precio de Costo *</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                {...register('costPrice', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.costPrice && (
                <p className="text-sm text-red-600">{errors.costPrice.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="salePrice">Precio de Venta *</Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                {...register('salePrice', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.salePrice && (
                <p className="text-sm text-red-600">{errors.salePrice.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxRate">IVA (%) *</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                {...register('taxRate', { valueAsNumber: true })}
                placeholder="16.00"
              />
              {errors.taxRate && (
                <p className="text-sm text-red-600">{errors.taxRate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentStock">Stock Inicial</Label>
              <Input
                id="currentStock"
                type="number"
                {...register('currentStock', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.currentStock && (
                <p className="text-sm text-red-600">{errors.currentStock.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Stock Mínimo</Label>
              <Input
                id="minStock"
                type="number"
                {...register('minStock', { valueAsNumber: true })}
                placeholder="10"
              />
              {errors.minStock && (
                <p className="text-sm text-red-600">{errors.minStock.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Producto
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
