'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QrCode, Package, Plus, Search, Tag, Building2 } from 'lucide-react'

export default function InventoryPage() {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [apiStatus, setApiStatus] = useState<'checking' | 'working' | 'error'>('checking')

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        // Check database and API by testing the products endpoint
        const response = await fetch('/api/products?limit=1')
        if (response.ok) {
          setDbStatus('connected')
          setApiStatus('working')
        } else {
          setDbStatus('error')
          setApiStatus('error')
        }
      } catch (error) {
        setDbStatus('error')
        setApiStatus('error')
      }
    }

    checkSystemStatus()
  }, [])
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sistema de Inventario</h1>
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
              Ver y gestionar todos los productos en tu inventario con filtros avanzados.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/inventory/products">
                <Package className="mr-2 h-4 w-4" />
                Ver Productos
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Gestión de Categorías
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Crear y gestionar categorías para organizar tus productos.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/inventory/categories">
                <Tag className="mr-2 h-4 w-4" />
                Gestionar Categorías
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Gestión de Proveedores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Administrar información de proveedores y sus productos asociados.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/inventory/suppliers">
                <Building2 className="mr-2 h-4 w-4" />
                Gestionar Proveedores
              </Link>
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
              {dbStatus === 'checking' ? (
                <span className="text-sm text-blue-600 font-medium">🔄 Verificando...</span>
              ) : dbStatus === 'connected' ? (
                <span className="text-sm text-green-600 font-medium">✓ Funcionando</span>
              ) : (
                <span className="text-sm text-red-600 font-medium">✗ Error de conexión</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Routes:</span>
              {apiStatus === 'checking' ? (
                <span className="text-sm text-blue-600 font-medium">🔄 Verificando...</span>
              ) : apiStatus === 'working' ? (
                <span className="text-sm text-green-600 font-medium">✓ Funcionando</span>
              ) : (
                <span className="text-sm text-red-600 font-medium">✗ Error</span>
              )}
            </div>
          </div>
          {dbStatus === 'connected' && apiStatus === 'working' ? (
            <p className="text-xs text-green-600 mt-4">
              ✓ Sistema completamente funcional. Todas las características están disponibles.
            </p>
          ) : dbStatus === 'error' || apiStatus === 'error' ? (
            <p className="text-xs text-red-600 mt-4">
              ✗ Hay problemas de configuración. Verifica la base de datos y las APIs.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-4">
              🔄 Verificando el estado del sistema...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
