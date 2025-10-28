import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateProductSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  costPrice: z.number().min(0, 'El precio de costo debe ser mayor a 0'),
  salePrice: z.number().min(0, 'El precio de venta debe ser mayor a 0'),
  taxRate: z.number().min(0).max(100, 'La tasa de impuesto debe estar entre 0 y 100'),
  minStock: z.number().min(0, 'El stock mínimo debe ser mayor o igual a 0'),
  categoryId: z.string().nullable().optional(),
  supplierId: z.string().nullable().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id: id },
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
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Error al obtener el producto' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('PUT Product ID:', id)
    
    const body = await request.json()
    const validatedData = updateProductSchema.parse(body)

    // Check if product exists - First try to find by id, if that fails try by barcode
    let existingProduct = null
    try {
      existingProduct = await prisma.product.findFirst({
        where: { 
          OR: [
            { id: id },
            { barcode: id }
          ]
        },
      })
    } catch (error) {
      console.error('Error finding product:', error)
      return NextResponse.json(
        { error: 'Error al buscar el producto' },
        { status: 500 }
      )
    }

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    const updatedProduct = await prisma.product.update({
      where: { id: existingProduct.id },
      data: {
        title: validatedData.title,
        name: validatedData.name,
        costPrice: validatedData.costPrice,
        salePrice: validatedData.salePrice,
        taxRate: validatedData.taxRate,
        minStock: validatedData.minStock,
      }
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('DELETE - Product ID received:', id)
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de producto requerido' },
        { status: 400 }
      )
    }

    // Try to find the product by ID first
    const existingProduct = await prisma.product.findUnique({
      where: { id: id },
    })

    console.log('Product found:', existingProduct ? 'Yes' : 'No')

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Delete the product
    await prisma.product.delete({
      where: { id: id },
    })

    console.log('Product deleted successfully')
    return NextResponse.json({ message: 'Producto eliminado exitosamente' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
