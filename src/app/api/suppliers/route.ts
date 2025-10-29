import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const supplierSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json(
      { error: 'Error al obtener los proveedores' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = supplierSchema.parse(body)

    // Convert empty strings to null for optional fields
    const cleanedData = {
      ...validatedData,
      email: validatedData.email || null,
      phone: validatedData.phone || null,
      address: validatedData.address || null,
    }

    // Check if supplier already exists
    const existingSupplier = await prisma.supplier.findUnique({
      where: { name: cleanedData.name },
    })

    if (existingSupplier) {
      return NextResponse.json(
        { error: 'Ya existe un proveedor con este nombre' },
        { status: 400 }
      )
    }

    const supplier = await prisma.supplier.create({
      data: cleanedData,
    })

    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error('Error creating supplier:', error)
    
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
