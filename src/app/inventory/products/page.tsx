'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { QrCode, Package, Plus, Search, Filter, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { EditProductModal } from '@/components/forms/EditProductModal'
import { AddStockModal } from '@/components/forms/AddStockModal'

interface Category {
  id: string
  name: string
  _count: { products: number }
}

interface Supplier {
  id: string
  name: string
  _count: { products: number }
}

interface Product {
  id: string
  barcode: string
  title: string
  name: string
  description?: string
  costPrice: number
  salePrice: number
  currentStock: number
  minStock: number
  category?: { id: string; name: string }
  supplier?: { id: string; name: string }
  createdAt: string
}

interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [addingStockProduct, setAddingStockProduct] = useState<Product | null>(null)
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch products with filters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search,
        ...(selectedCategory && selectedCategory !== 'all' && { categoryId: selectedCategory }),
        ...(selectedSupplier && selectedSupplier !== 'all' && { supplierId: selectedSupplier }),
      })

      const [productsRes, categoriesRes, suppliersRes] = await Promise.all([
        fetch(`/api/products?${params}`),
        fetch('/api/categories'),
        fetch('/api/suppliers'),
      ])

      if (productsRes.ok) {
        const productsData: ProductsResponse = await productsRes.json()
        setProducts(productsData.products)
        setTotalPages(productsData.totalPages)
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData)
      }

      if (suppliersRes.ok) {
        const suppliersData = await suppliersRes.json()
        setSuppliers(suppliersData)
      }
    } catch (error) {
      toast.error('Error al cargar los datos')
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentPage, search, selectedCategory, selectedSupplier])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchData()
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedCategory('all')
    setSelectedSupplier('all')
    setCurrentPage(1)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsEditModalOpen(true)
  }

  const handleEditSuccess = (updatedProduct: Product) => {
    // Update the product in the list
    setProducts(prevProducts => 
      prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    )
    setIsEditModalOpen(false)
    setEditingProduct(null)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingProduct(null)
  }

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el producto "${product.title}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Producto eliminado exitosamente')
        // Remove product from the list
        setProducts(prevProducts => prevProducts.filter(p => p.id !== product.id))
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar el producto')
      }
    } catch (error) {
      toast.error('Error al eliminar el producto')
    }
  }

  const handleAddStock = (product: Product) => {
    setAddingStockProduct(product)
    setIsAddStockModalOpen(true)
  }

  const handleAddStockSuccess = (updatedProduct: Product) => {
    // Update the product in the list
    setProducts(prevProducts => 
      prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    )
    setIsAddStockModalOpen(false)
    setAddingStockProduct(null)
  }

  const handleCloseAddStockModal = () => {
    setIsAddStockModalOpen(false)
    setAddingStockProduct(null)
  }

  return (
    <div className="container mx-auto p-4 pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Productos del Inventario</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/inventory/scan">
              <QrCode className="mr-2 h-4 w-4" />
              Escanear
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/inventory/categories">
              <Package className="mr-2 h-4 w-4" />
              Categorías
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/inventory/suppliers">
              <Package className="mr-2 h-4 w-4" />
              Proveedores
            </Link>
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Código, título o nombre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({category._count.products})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="supplier">Proveedor</Label>
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los proveedores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los proveedores</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name} ({supplier._count.products})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit">
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Button>
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Limpiar
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Productos */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <p>Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">No se encontraron productos</p>
              <p className="text-muted-foreground mb-4">
                {search || (selectedCategory && selectedCategory !== 'all') || (selectedSupplier && selectedSupplier !== 'all')
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza escaneando tu primer producto'}
              </p>
              <Button asChild>
                <Link href="/inventory/scan">
                  <QrCode className="mr-2 h-4 w-4" />
                  Escanear Producto
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      <div className="md:col-span-2">
                        <h3 className="font-semibold">{product.title}</h3>
                        <p className="text-sm text-muted-foreground">{product.name}</p>
                        <p className="text-xs font-mono text-muted-foreground">{product.barcode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Stock</p>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{product.currentStock}</span>
                          <Badge 
                            variant={product.currentStock <= product.minStock ? 'destructive' : 'default'}
                            className="text-xs"
                          >
                            {product.currentStock <= product.minStock ? 'Bajo' : 'OK'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Precio</p>
                        <p className="font-semibold">${Number(product.salePrice).toFixed(2)}</p>
                      </div>
                      <div>
                        {product.category && (
                          <Badge variant="secondary" className="mb-1">
                            {product.category.name}
                          </Badge>
                        )}
                        {product.supplier && (
                          <Badge variant="outline" className="text-xs">
                            {product.supplier.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditProduct(product)}
                          title="Editar producto"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAddStock(product)}
                          title="Agregar stock"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteProduct(product)}
                          title="Eliminar producto"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de edición */}
      <EditProductModal
        product={editingProduct}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />

      {/* Modal de agregar stock */}
      <AddStockModal
        product={addingStockProduct}
        isOpen={isAddStockModalOpen}
        onClose={handleCloseAddStockModal}
        onSuccess={handleAddStockSuccess}
      />
    </div>
  )
}
