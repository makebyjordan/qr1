import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { stockUpdateSchema } from '@/lib/validations/stock'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = stockUpdateSchema.parse(body)

    // Find the product
    const product = await prisma.product.findUnique({
      where: { barcode: validatedData.barcode },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Update stock and create movement in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: {
          currentStock: {
            increment: validatedData.quantity,
          },
        },
      })

      // Create stock movement record
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          type: 'ENTRY',
          quantity: validatedData.quantity,
          unitPrice: product.costPrice,
          totalValue: validatedData.quantity * Number(product.costPrice),
          notes: validatedData.notes || 'Entrada de stock',
        },
      })

      return updatedProduct
    })

    return NextResponse.json({
      success: true,
      newStock: result.currentStock,
      product: result,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error adding stock:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
