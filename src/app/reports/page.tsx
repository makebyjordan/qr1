'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  Euro,
  Printer,
  Download,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface ReportData {
  period: string
  sales: {
    total: number
    count: number
    average: number
    items: Array<{
      id: string
      productTitle: string
      quantity: number
      total: number
      createdAt: string
    }>
  }
  topProducts: Array<{
    productId: string
    productTitle: string
    totalQuantity: number
    totalRevenue: number
  }>
  lowStock: Array<{
    id: string
    title: string
    currentStock: number
    minStock: number
  }>
  summary: {
    totalProducts: number
    totalStock: number
    totalValue: number
  }
}

const REPORT_PERIODS = [
  { value: '24h', label: 'Últimas 24 horas' },
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Último mes' },
  { value: 'all', label: 'Completo (Todo el tiempo)' },
]

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('24h')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchReport()
  }, [selectedPeriod])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/reports?period=${selectedPeriod}`)
      
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      } else {
        toast.error('Error al cargar el reporte')
      }
    } catch (error) {
      console.error('Error fetching report:', error)
      toast.error('Error al cargar el reporte')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    if (!reportData) return

    const csvContent = generateCSV(reportData)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `reporte_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Reporte descargado exitosamente')
  }

  const generateCSV = (data: ReportData) => {
    let csv = 'REPORTE DE VENTAS E INVENTARIO\n'
    csv += `Período: ${REPORT_PERIODS.find(p => p.value === selectedPeriod)?.label}\n`
    csv += `Generado: ${new Date().toLocaleString('es-ES')}\n\n`
    
    csv += 'RESUMEN DE VENTAS\n'
    csv += `Total Ventas,${data.sales.total.toFixed(2)} €\n`
    csv += `Número de Transacciones,${data.sales.count}\n`
    csv += `Promedio por Venta,${data.sales.average.toFixed(2)} €\n\n`
    
    csv += 'PRODUCTOS MÁS VENDIDOS\n'
    csv += 'Producto,Cantidad Vendida,Ingresos Totales\n'
    data.topProducts.forEach(product => {
      csv += `"${product.productTitle}",${product.totalQuantity},${product.totalRevenue.toFixed(2)} €\n`
    })
    
    csv += '\nPRODUCTOS CON STOCK BAJO\n'
    csv += 'Producto,Stock Actual,Stock Mínimo\n'
    data.lowStock.forEach(product => {
      csv += `"${product.title}",${product.currentStock},${product.minStock}\n`
    })
    
    return csv
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

  return (
    <div className="container mx-auto p-4 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between print-hidden">
        <div>
          <h1 className="text-3xl font-bold">Reportes</h1>
          <p className="text-muted-foreground">
            Análisis de ventas e inventario
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_PERIODS.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReport}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!reportData}
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar CSV
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            disabled={!reportData}
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Generando reporte...</p>
          </div>
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Print Header */}
          <div className="hidden print-block text-center mb-8">
            <h1 className="text-2xl font-bold">REPORTE DE VENTAS E INVENTARIO</h1>
            <p className="text-lg">
              {REPORT_PERIODS.find(p => p.value === selectedPeriod)?.label}
            </p>
            <p className="text-sm text-gray-600">
              Generado el {new Date().toLocaleString('es-ES')}
            </p>
            <Separator className="mt-4" />
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
                <Euro className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  €{reportData.sales.total.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {reportData.sales.count} transacciones
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promedio por Venta</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  €{reportData.sales.average.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  por transacción
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData.summary.totalProducts}
                </div>
                <p className="text-xs text-muted-foreground">
                  productos registrados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Total</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reportData.summary.totalStock}
                </div>
                <p className="text-xs text-muted-foreground">
                  unidades en inventario
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Productos Más Vendidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reportData.topProducts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No hay ventas en este período
                  </p>
                ) : (
                  <div className="space-y-3">
                    {reportData.topProducts.map((product, index) => (
                      <div key={product.productId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium">{product.productTitle}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.totalQuantity} unidades vendidas
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            €{product.totalRevenue.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Low Stock */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-orange-500" />
                  Stock Bajo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reportData.lowStock.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Todos los productos tienen stock suficiente
                  </p>
                ) : (
                  <div className="space-y-3">
                    {reportData.lowStock.map((product) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{product.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Mínimo requerido: {product.minStock}
                          </p>
                        </div>
                        <Badge 
                          variant={product.currentStock === 0 ? "destructive" : "secondary"}
                          className={product.currentStock === 0 ? "" : "text-orange-600 bg-orange-100"}
                        >
                          {product.currentStock} unidades
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Sales */}
          {reportData.sales.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Ventas Recientes ({reportData.sales.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.sales.items.slice(0, 10).map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{sale.productTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(sale.createdAt)} • {sale.quantity} unidades
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          €{Number(sale.total).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {reportData.sales.items.length > 10 && (
                    <p className="text-center text-sm text-muted-foreground pt-2">
                      Y {reportData.sales.items.length - 10} ventas más...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-semibold mb-2">No hay datos disponibles</p>
          <p className="text-muted-foreground">
            Selecciona un período para generar el reporte
          </p>
        </div>
      )}
    </div>
  )
}
