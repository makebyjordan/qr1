import { z } from 'zod'

export const stockUpdateSchema = z.object({
  barcode: z.string().min(1, 'El código de barras es requerido'),
  quantity: z.number().int().min(1, 'La cantidad debe ser mayor a 0'),
  notes: z.string().optional(),
})

export const stockMovementSchema = z.object({
  id: z.string(),
  productId: z.string(),
  type: z.enum(['ENTRY', 'SALE', 'ADJUSTMENT']),
  quantity: z.number(),
  unitPrice: z.number(),
  totalValue: z.number(),
  notes: z.string().nullable(),
  createdAt: z.date(),
  createdBy: z.string().nullable(),
})

export type StockUpdateData = z.infer<typeof stockUpdateSchema>
export type StockMovementData = z.infer<typeof stockMovementSchema>
