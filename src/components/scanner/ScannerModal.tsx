'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BarcodeScanner } from './BarcodeScanner'
import { X } from 'lucide-react'

interface ScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onScanSuccess: (code: string) => void
  title?: string
}

export function ScannerModal({ isOpen, onClose, onScanSuccess, title = 'Escanear Código' }: ScannerModalProps) {
  const [error, setError] = useState<string | null>(null)

  const handleScanSuccess = (code: string) => {
    setError(null)
    onScanSuccess(code)
    onClose()
  }

  const handleError = (error: string) => {
    setError(error)
  }

  const handleClose = () => {
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {title}
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 min-h-[400px]">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          <div className="w-full">
            <BarcodeScanner
              onScanSuccess={handleScanSuccess}
              onError={handleError}
              isActive={isOpen}
            />
          </div>
          
          <div className="flex justify-center pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
