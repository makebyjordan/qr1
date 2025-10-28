'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Calendar, Package, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Sale {
  id: string
  quantity: number
  unitPrice: number
  subtotal: number
  taxAmount: number
  total: number
  createdAt: string
  product: {
    id: string
    title: string
    name: string
    barcode: string
  }
}

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/sales')
      if (response.ok) {
        const data = await response.json()
        setSales(data.sales || [])
      }
    } catch (error) {
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.total), 0)
  const totalItems = sales.reduce((sum, sale) => sum + sale.quantity, 0)

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/sales">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Ventas
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Historial de Ventas</h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {sales.length} transacciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Vendidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              unidades totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio por Venta</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{sales.length > 0 ? (totalSales / sales.length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              por transacción
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales List */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Cargando historial de ventas...</p>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">No hay ventas registradas</p>
              <p className="text-muted-foreground mb-4">
                Las ventas aparecerán aquí una vez que comiences a vender productos
              </p>
              <Button asChild>
                <Link href="/sales">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Realizar Primera Venta
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{sale.product.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {sale.product.barcode}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {sale.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(sale.createdAt)}
                    </p>
                  </div>
                  
                  <div className="text-center mx-4">
                    <p className="text-sm font-medium">Cantidad</p>
                    <p className="text-lg font-bold">{sale.quantity}</p>
                  </div>
                  
                  <div className="text-center mx-4">
                    <p className="text-sm font-medium">Precio Unit.</p>
                    <p className="text-lg">€{Number(sale.unitPrice).toFixed(2)}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold text-green-600">
                      €{Number(sale.total).toFixed(2)}
                    </p>
                    {Number(sale.taxAmount) > 0 && (
                      <p className="text-xs text-muted-foreground">
                        (IVA: €{Number(sale.taxAmount).toFixed(2)})
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
