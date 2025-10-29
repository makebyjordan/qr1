import { z } from 'zod'

export const saleSchema = z.object({
  barcode: z.string().min(1, 'El código de barras es requerido'),
  quantity: z.number().int().min(1, 'La cantidad debe ser mayor a 0'),
})

export const saleResponseSchema = z.object({
  id: z.string(),
  productId: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  subtotal: z.number(),
  taxAmount: z.number(),
  total: z.number(),
  createdAt: z.date(),
})

export type SaleFormData = z.infer<typeof saleSchema>
export type SaleResponse = z.infer<typeof saleResponseSchema>
