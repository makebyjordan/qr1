'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Package, 
  ShoppingCart, 
  QrCode, 
  BarChart3, 
  Settings,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Inventario',
    href: '/inventory',
    icon: Package,
    children: [
      { name: 'Ver Productos', href: '/inventory/products' },
      { name: 'Escanear', href: '/inventory/scan' },
      { name: 'Categorías', href: '/inventory/categories' },
      { name: 'Proveedores', href: '/inventory/suppliers' },
    ]
  },
  {
    name: 'Ventas',
    href: '/sales',
    icon: ShoppingCart,
    children: [
      { name: 'Nueva Venta', href: '/sales' },
      { name: 'Historial', href: '/sales/history' },
    ]
  },
  {
    name: 'Reportes',
    href: '/reports',
    icon: BarChart3,
  },
  {
    name: 'Escáner',
    href: '/inventory/scan',
    icon: QrCode,
  },
]

export function Navbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const getActiveSection = () => {
    if (pathname === '/' || pathname === '/dashboard') return 'Dashboard'
    if (pathname.startsWith('/inventory')) return 'Inventario'
    if (pathname.startsWith('/sales')) return 'Ventas'
    if (pathname.startsWith('/reports')) return 'Reportes'
    return ''
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Package className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                InventoryQR
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <div key={item.name} className="relative group">
                  <Button
                    asChild
                    variant={active ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Link href={item.href}>
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </Button>
                  
                  {/* Dropdown for items with children */}
                  {item.children && (
                    <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block px-4 py-2 text-sm hover:bg-gray-100 ${
                              pathname === child.href ? 'bg-gray-50 text-primary font-medium' : 'text-gray-700'
                            }`}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="py-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium ${
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                    
                    {/* Mobile submenu */}
                    {item.children && active && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block px-3 py-2 text-sm rounded-md ${
                              pathname === child.href
                                ? 'bg-gray-100 text-primary font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Breadcrumb for current section */}
      {pathname !== '/' && pathname !== '/dashboard' && (
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/dashboard" className="hover:text-primary">
                Dashboard
              </Link>
              <span>/</span>
              <span className="font-medium text-gray-900">
                {getActiveSection()}
              </span>
              {pathname !== '/inventory' && pathname !== '/sales' && (
                <>
                  <span>/</span>
                  <span className="text-gray-900">
                    {pathname.includes('/products') && 'Productos'}
                    {pathname.includes('/scan') && 'Escáner'}
                    {pathname.includes('/categories') && 'Categorías'}
                    {pathname.includes('/suppliers') && 'Proveedores'}
                    {pathname.includes('/history') && 'Historial'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
