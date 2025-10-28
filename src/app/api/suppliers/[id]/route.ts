import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const supplierSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supplier = await prisma.supplier.findUnique({
      where: { id: id },
      include: {
        products: {
          select: {
            id: true,
            barcode: true,
            title: true,
            name: true,
            currentStock: true,
            salePrice: true,
          }
        },
        _count: {
          select: { products: true }
        }
      }
    })

    if (!supplier) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(supplier)
  } catch (error) {
    console.error('Error fetching supplier:', error)
    return NextResponse.json(
      { error: 'Error al obtener el proveedor' },
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
    const body = await request.json()
    const validatedData = supplierSchema.parse(body)

    // Convert empty strings to null for optional fields
    const cleanedData = {
      ...validatedData,
      email: validatedData.email || null,
      phone: validatedData.phone || null,
      address: validatedData.address || null,
    }

    // Check if supplier exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id: id },
    })

    if (!existingSupplier) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      )
    }

    // Check if name is already taken by another supplier
    if (cleanedData.name !== existingSupplier.name) {
      const nameExists = await prisma.supplier.findUnique({
        where: { name: cleanedData.name },
      })

      if (nameExists) {
        return NextResponse.json(
          { error: 'Ya existe un proveedor con este nombre' },
          { status: 400 }
        )
      }
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id: id },
      data: cleanedData,
    })

    return NextResponse.json(updatedSupplier)
  } catch (error) {
    console.error('Error updating supplier:', error)
    
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
    // Check if supplier exists and has no products
    const supplier = await prisma.supplier.findUnique({
      where: { id: id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!supplier) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      )
    }

    // Check if supplier has products
    if (supplier._count.products > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un proveedor que tiene productos asociados' },
        { status: 400 }
      )
    }

    await prisma.supplier.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: 'Proveedor eliminado exitosamente' })
  } catch (error) {
    console.error('Error deleting supplier:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
