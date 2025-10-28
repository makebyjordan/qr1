import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { productSchema } from '@/lib/validations/product'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')
    const supplierId = searchParams.get('supplierId')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.OR = [
        { barcode: { contains: search, mode: 'insensitive' as const } },
        { title: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } },
      ]
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (supplierId) {
      where.supplierId = supplierId
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            }
          },
          supplier: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = productSchema.parse(body)

    // Check if product with barcode already exists
    const existingProduct = await prisma.product.findUnique({
      where: { barcode: validatedData.barcode },
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Ya existe un producto con este código de barras' },
        { status: 409 }
      )
    }

    // Create product and initial stock movement in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          barcode: validatedData.barcode,
          title: validatedData.title,
          name: validatedData.name,
          description: validatedData.description || null,
          costPrice: validatedData.costPrice,
          salePrice: validatedData.salePrice,
          taxRate: validatedData.taxRate,
          currentStock: validatedData.currentStock,
          minStock: validatedData.minStock,
          categoryId: validatedData.categoryId || null,
          supplierId: validatedData.supplierId || null,
        },
      })

      // Create initial stock movement if there's initial stock
      if (validatedData.currentStock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            type: 'ENTRY',
            quantity: validatedData.currentStock,
            unitPrice: validatedData.costPrice,
            totalValue: validatedData.currentStock * validatedData.costPrice,
            notes: 'Stock inicial',
          },
        })
      }

      return product
    })

    return NextResponse.json({
      success: true,
      product: result,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
