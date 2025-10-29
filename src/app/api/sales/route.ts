import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { saleSchema } from '@/lib/validations/sale'
import { calculateSaleAmounts } from '@/lib/utils/calculations'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = saleSchema.parse(body)

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

    // Check if there's enough stock
    if (product.currentStock < validatedData.quantity) {
      return NextResponse.json(
        { 
          error: 'Stock insuficiente',
          available: product.currentStock,
          requested: validatedData.quantity
        },
        { status: 400 }
      )
    }

    // Calculate sale amounts
    const amounts = calculateSaleAmounts(
      validatedData.quantity,
      Number(product.salePrice),
      Number(product.taxRate)
    )

    // Process sale in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: {
          currentStock: {
            decrement: validatedData.quantity,
          },
        },
      })

      // Create sale record
      const sale = await tx.sale.create({
        data: {
          productId: product.id,
          quantity: validatedData.quantity,
          unitPrice: product.salePrice,
          subtotal: amounts.subtotal,
          taxAmount: amounts.taxAmount,
          total: amounts.total,
        },
      })

      // Create stock movement record
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          type: 'SALE',
          quantity: -validatedData.quantity, // Negative for sales
          unitPrice: product.salePrice,
          totalValue: -amounts.total, // Negative for sales
          notes: `Venta - ${sale.id}`,
        },
      })

      return { sale, updatedProduct }
    })

    return NextResponse.json({
      success: true,
      sale: result.sale,
      newStock: result.updatedProduct.currentStock,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error processing sale:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              barcode: true,
              title: true,
              name: true,
            },
          },
        },
      }),
      prisma.sale.count({ where }),
    ])

    return NextResponse.json({
      sales,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching sales:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
