import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const sellSchema = z.object({
  quantity: z.number().int().min(1, 'La cantidad debe ser mayor a 0'),
  salePrice: z.number().min(0, 'El precio de venta debe ser mayor o igual a 0'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = sellSchema.parse(body)

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

    // Check if there's enough stock
    if (product.currentStock < validatedData.quantity) {
      return NextResponse.json(
        { error: `Stock insuficiente. Disponible: ${product.currentStock}` },
        { status: 400 }
      )
    }

    // Update product stock and create sale record in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: id },
        data: {
          currentStock: product.currentStock - validatedData.quantity,
        },
      })

      // Calculate amounts
      const subtotal = validatedData.quantity * validatedData.salePrice
      const taxRate = Number(product.taxRate)
      const taxAmount = subtotal * (taxRate / 100)
      const total = subtotal + taxAmount

      // Create sale record
      const sale = await tx.sale.create({
        data: {
          productId: id,
          quantity: validatedData.quantity,
          unitPrice: validatedData.salePrice,
          subtotal: subtotal,
          taxAmount: taxAmount,
          total: total,
        },
      })

      // Create stock movement record
      await tx.stockMovement.create({
        data: {
          productId: id,
          type: 'SALE',
          quantity: validatedData.quantity,
          unitPrice: validatedData.salePrice,
          totalValue: total,
          notes: `Venta - ${validatedData.quantity} unidades`,
        },
      })

      return { updatedProduct, sale }
    })

    return NextResponse.json({
      message: 'Venta registrada exitosamente',
      product: result.updatedProduct,
      sale: result.sale,
    })
  } catch (error) {
    console.error('Error processing sale:', error)
    
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
