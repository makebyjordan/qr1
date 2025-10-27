import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const barcode = searchParams.get('barcode')

    if (!barcode) {
      return NextResponse.json(
        { error: 'El código de barras es requerido' },
        { status: 400 }
      )
    }

    const product = await prisma.product.findUnique({
      where: { barcode },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        sales: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    return NextResponse.json({
      exists: !!product,
      product: product || null,
    })
  } catch (error) {
    console.error('Error checking product:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
