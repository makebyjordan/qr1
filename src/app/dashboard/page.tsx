import { StatsCards } from '@/components/dashboard/StatsCards'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { QrCode, Package, ShoppingCart, Plus } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/inventory/scan">
              <QrCode className="mr-2 h-4 w-4" />
              Escanear
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/sales">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Nueva Venta
            </Link>
          </Button>
        </div>
      </div>

      <StatsCards />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Gestión de Inventario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Administra tu inventario, agrega productos y controla el stock.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/inventory/scan">
                  <QrCode className="mr-2 h-4 w-4" />
                  Escanear Producto
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/inventory">
                  <Package className="mr-2 h-4 w-4" />
                  Ver Inventario
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Punto de Venta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Procesa ventas rápidamente escaneando códigos de barras.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/sales">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Nueva Venta
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/sales/history">
                  Ver Historial
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Accede rápidamente a las funciones más utilizadas.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/reports">
                  Ver Reportes
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/movements">
                  Movimientos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
