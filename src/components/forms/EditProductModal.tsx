'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const editProductSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  costPrice: z.number().min(0, 'El precio de costo debe ser mayor a 0'),
  salePrice: z.number().min(0, 'El precio de venta debe ser mayor a 0'),
  taxRate: z.number().min(0).max(100, 'La tasa de impuesto debe estar entre 0 y 100'),
  minStock: z.number().min(0, 'El stock mínimo debe ser mayor o igual a 0'),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
})

type EditProductFormData = z.infer<typeof editProductSchema>

interface Category {
  id: string
  name: string
}

interface Supplier {
  id: string
  name: string
}

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

interface EditProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedProduct: Product) => void
}

export function EditProductModal({ product, isOpen, onClose, onSuccess }: EditProductModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSupplier, setSelectedSupplier] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
  })

  // Fetch categories and suppliers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, suppliersRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/suppliers'),
        ])

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData)
        }

        if (suppliersRes.ok) {
          const suppliersData = await suppliersRes.json()
          setSuppliers(suppliersData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    if (isOpen) {
      fetchData()
    }
  }, [isOpen])

  // Reset form when product changes
  useEffect(() => {
    if (product && isOpen) {
      reset({
        title: product.title,
        name: product.name,
        description: product.description || '',
        costPrice: Number(product.costPrice),
        salePrice: Number(product.salePrice),
        taxRate: Number(product.taxRate),
        minStock: product.minStock,
      })
      setSelectedCategory(product.categoryId || 'none')
      setSelectedSupplier(product.supplierId || 'none')
    }
  }, [product, isOpen, reset])

  const onSubmit = async (data: EditProductFormData) => {
    if (!product) return

    setIsLoading(true)
    try {
      const updateData = {
        ...data,
        categoryId: selectedCategory === 'none' ? null : selectedCategory,
        supplierId: selectedSupplier === 'none' ? null : selectedSupplier,
      }

      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar el producto')
      }

      toast.success('Producto actualizado exitosamente')
      onSuccess(result)
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el producto')
    } finally {
      setIsLoading(false)
    }
  }

  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Código de Barras</Label>
              <Input
                id="barcode"
                value={product.barcode}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                El código de barras no se puede modificar
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Título del producto"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nombre completo del producto"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descripción opcional del producto"
                rows={3}
              />
            </div>

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
              <Label htmlFor="taxRate">Tasa de Impuesto (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                {...register('taxRate', { valueAsNumber: true })}
                placeholder="16"
              />
              {errors.taxRate && (
                <p className="text-sm text-red-600">{errors.taxRate.message}</p>
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

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin categoría</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Proveedor</Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin proveedor</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Stock actual:</strong> {product.currentStock} unidades
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Para modificar el stock, usa la función "Agregar Stock" desde la lista de productos.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Actualizar Producto
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
