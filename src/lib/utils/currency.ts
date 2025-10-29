export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-MX').format(value)
}
