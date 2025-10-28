import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '24h'

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date | undefined

    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'all':
        startDate = undefined // No date filter for all time
        break
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    const dateFilter = startDate ? { gte: startDate } : undefined

    // Get sales data
    const sales = await prisma.sale.findMany({
      where: dateFilter ? { createdAt: dateFilter } : undefined,
      include: {
        product: {
          select: {
            title: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate sales summary
    const salesTotal = sales.reduce((sum, sale) => sum + Number(sale.total), 0)
    const salesCount = sales.length
    const salesAverage = salesCount > 0 ? salesTotal / salesCount : 0

    // Get top products (most sold by quantity)
    const productSales = new Map<string, {
      productId: string
      productTitle: string
      totalQuantity: number
      totalRevenue: number
    }>()

    sales.forEach(sale => {
      const existing = productSales.get(sale.productId)
      if (existing) {
        existing.totalQuantity += sale.quantity
        existing.totalRevenue += Number(sale.total)
      } else {
        productSales.set(sale.productId, {
          productId: sale.productId,
          productTitle: sale.product.title,
          totalQuantity: sale.quantity,
          totalRevenue: Number(sale.total),
        })
      }
    })

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10)

    // Get low stock products
    const lowStockProducts = await prisma.product.findMany({
      where: {
        OR: [
          { currentStock: { lte: prisma.product.fields.minStock } },
          { currentStock: 0 },
        ],
      },
      select: {
        id: true,
        title: true,
        currentStock: true,
        minStock: true,
      },
      orderBy: { currentStock: 'asc' },
      take: 20,
    })

    // Get inventory summary
    const inventorySummary = await prisma.product.aggregate({
      _count: { id: true },
      _sum: { 
        currentStock: true,
        salePrice: true,
      },
    })

    const totalProducts = inventorySummary._count.id || 0
    const totalStock = inventorySummary._sum.currentStock || 0

    // Calculate total inventory value
    const products = await prisma.product.findMany({
      select: {
        currentStock: true,
        salePrice: true,
      },
    })

    const totalValue = products.reduce((sum, product) => {
      return sum + (product.currentStock * Number(product.salePrice))
    }, 0)

    // Format sales items for response
    const salesItems = sales.map(sale => ({
      id: sale.id,
      productTitle: sale.product.title,
      quantity: sale.quantity,
      total: Number(sale.total),
      createdAt: sale.createdAt.toISOString(),
    }))

    const reportData = {
      period,
      sales: {
        total: salesTotal,
        count: salesCount,
        average: salesAverage,
        items: salesItems,
      },
      topProducts,
      lowStock: lowStockProducts,
      summary: {
        totalProducts,
        totalStock,
        totalValue,
      },
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
