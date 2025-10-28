import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const addStockSchema = z.object({
  quantity: z.number().int().min(1, 'La cantidad debe ser mayor a 0'),
  unitPrice: z.number().min(0, 'El precio unitario debe ser mayor o igual a 0'),
  notes: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = addStockSchema.parse(body)

    // Find the product
    const product = await prisma.product.findUnique({
      where: { id: id },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Add stock and create stock movement in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: id },
        data: {
          currentStock: product.currentStock + validatedData.quantity,
        },
      })

      // Create stock movement record
      await tx.stockMovement.create({
        data: {
          productId: id,
          type: 'ENTRY',
          quantity: validatedData.quantity,
          unitPrice: validatedData.unitPrice,
          totalValue: validatedData.quantity * validatedData.unitPrice,
          notes: validatedData.notes || `Entrada de stock - ${validatedData.quantity} unidades`,
        },
      })

      return { updatedProduct }
    })

    return NextResponse.json({
      message: 'Stock agregado exitosamente',
      product: result.updatedProduct,
    })
  } catch (error) {
    console.error('Error adding stock:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
