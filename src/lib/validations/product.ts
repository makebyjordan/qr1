import { z } from 'zod'

export const productSchema = z.object({
  barcode: z.string().min(1, 'El código de barras es requerido'),
  title: z.string().min(1, 'El título es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  costPrice: z.number().min(0, 'El precio de costo debe ser mayor a 0'),
  salePrice: z.number().min(0, 'El precio de venta debe ser mayor a 0'),
  taxRate: z.number().min(0).max(100, 'La tasa de impuesto debe estar entre 0 y 100'),
  currentStock: z.number().int().min(0, 'El stock actual debe ser mayor o igual a 0'),
  minStock: z.number().int().min(0, 'El stock mínimo debe ser mayor o igual a 0'),
  categoryId: z.string().nullable().optional(),
  supplierId: z.string().nullable().optional(),
})

export const productUpdateSchema = productSchema.partial().omit({ barcode: true })

export type ProductFormData = z.infer<typeof productSchema>
export type ProductUpdateData = z.infer<typeof productUpdateSchema>
