import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QrCode, Package, Plus, Search } from 'lucide-react'

export default function InventoryPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inventario</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/inventory/scan">
              <QrCode className="mr-2 h-4 w-4" />
              Escanear
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Escanear Productos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Usa la cámara para escanear códigos QR o códigos de barras y agregar productos al inventario.
            </p>
            <Button asChild className="w-full">
              <Link href="/inventory/scan">
                <QrCode className="mr-2 h-4 w-4" />
                Comenzar Escaneo
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Productos Registrados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ver todos los productos registrados en el sistema con su información de stock.
            </p>
            <Button variant="outline" className="w-full" disabled>
              <Package className="mr-2 h-4 w-4" />
              Ver Productos (Próximamente)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Búsqueda Manual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Buscar productos por nombre, código de barras o categoría.
            </p>
            <Button variant="outline" className="w-full" disabled>
              <Search className="mr-2 h-4 w-4" />
              Buscar (Próximamente)
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Escáner de códigos:</span>
              <span className="text-sm text-green-600 font-medium">✓ Funcionando</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Base de datos:</span>
              <span className="text-sm text-yellow-600 font-medium">⚠ Pendiente configuración</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Routes:</span>
              <span className="text-sm text-green-600 font-medium">✓ Funcionando</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Para activar todas las funcionalidades, configura la base de datos siguiendo las instrucciones en DATABASE_SETUP.md
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
