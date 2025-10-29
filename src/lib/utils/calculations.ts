export function calculateSaleAmounts(
  quantity: number,
  unitPrice: number,
  taxRate: number
) {
  const subtotal = quantity * unitPrice
  const taxAmount = (subtotal * taxRate) / 100
  const total = subtotal + taxAmount

  return {
    subtotal: Number(subtotal.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
  }
}

export function calculateStockValue(stock: number, unitPrice: number): number {
  return Number((stock * unitPrice).toFixed(2))
}
