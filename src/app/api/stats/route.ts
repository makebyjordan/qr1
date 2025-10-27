import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [
      totalProducts,
      todaySales,
    ] = await Promise.all([
      // Total products count
      prisma.product.count(),
      
      // Today's sales total
      prisma.sale.aggregate({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        _sum: {
          total: true,
          quantity: true,
        },
        _count: true,
      }),
    ])

    // Get products with low stock (separate query for simplicity)
    const allProducts = await prisma.product.findMany({
      select: {
        currentStock: true,
        minStock: true,
        costPrice: true,
      },
    })

    const lowStockCount = allProducts.filter((p: any) => p.currentStock <= p.minStock).length
    const totalInventoryValue = allProducts.reduce((sum: number, p: any) => sum + (p.currentStock * Number(p.costPrice)), 0)

    return NextResponse.json({
      totalProducts,
      lowStockProducts: lowStockCount,
      inventoryValue: totalInventoryValue,
      todaySales: {
        total: Number(todaySales._sum?.total || 0),
        quantity: Number(todaySales._sum?.quantity || 0),
        count: Number(todaySales._count || 0),
      },
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    
    // Return mock data if database is not available
    return NextResponse.json({
      totalProducts: 0,
      lowStockProducts: 0,
      inventoryValue: 0,
      todaySales: {
        total: 0,
        quantity: 0,
        count: 0,
      },
    })
  }
}
