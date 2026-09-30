import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  initialOrganization,
  initialClients,
  initialProducts,
  initialPlates,
  initialSales,
  initialInventoryMovements,
  initialCredentials
} from '@/data/mockData'

const AppContext = createContext(null)
const PRODUCTS_STORAGE_KEY = 'craft-nfc-products'

function loadStoredProducts() {
  try {
    const stored = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY))
    if (!Array.isArray(stored)) return initialProducts
    return initialProducts.map(product => ({ ...product, ...(stored.find(item => item.id === product.id) || {}) }))
  } catch {
    return initialProducts
  }
}

export function AppProvider({ children }) {
  const [organization, setOrganization] = useState(initialOrganization)
  const [clients, setClients] = useState(initialClients)
  const [products, setProducts] = useState(loadStoredProducts)
  const [plates, setPlates] = useState(initialPlates)
  const [sales, setSales] = useState(initialSales)
  const [inventoryMovements, setInventoryMovements] = useState(initialInventoryMovements)
  const [credentials, setCredentials] = useState(initialCredentials)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products))
  }, [products])

  // Client operations
  const addClient = (newClient) => {
    const client = {
      ...newClient,
      id: 'cli-' + Date.now(),
      status: 'active',
      created_at: new Date().toISOString().split('T')[0]
    }
    setClients(prev => [client, ...prev])
    return client
  }

  const updateClient = (id, updatedData) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c))
  }

  // Plate operations
  const addPlate = (plateData) => {
    const plate = {
      ...plateData,
      id: 'plt-' + Date.now(),
      code: plateData.code || `NFC-${String(plates.length + 1).padStart(6, '0')}`,
      status: plateData.status || 'in_stock',
      qr_code_url: `https://craftnfc.com/r/${plateData.code || `NFC-${String(plates.length + 1).padStart(6, '0')}`}`,
      activated_at: plateData.status === 'active' ? new Date().toISOString().split('T')[0] : null
    }
    setPlates(prev => [plate, ...prev])
    return plate
  }

  const addPlateBatch = ({ product, quantity, serialPrefix, destinationUrl = '', costPrice, salePrice, minimumStock }) => {
    const batchId = Date.now()
    const start = plates.length + 1
    const newPlates = Array.from({ length: quantity }, (_, index) => {
      const code = `NFC-${String(start + index).padStart(6, '0')}`
      return {
        id: `plt-${batchId}-${index}`,
        code,
        serial_number: `${serialPrefix || 'SN-NFC'}-${String(start + index).padStart(5, '0')}`,
        product_id: product.id,
        product_name: product.name,
        client_name: null,
        client_id: null,
        status: 'in_stock',
        google_review_url: destinationUrl,
        qr_code_url: `https://craftnfc.com/r/${code}`,
        activated_at: null
      }
    })
    setPlates(prev => [...newPlates, ...prev])
    setProducts(prev => prev.map(item => item.id === product.id ? {
      ...item,
      current_stock: Number(item.current_stock || 0) + quantity,
      cost_price: Number(costPrice ?? item.cost_price),
      sale_price: Number(salePrice ?? item.sale_price),
      minimum_stock: Number(minimumStock ?? item.minimum_stock)
    } : item))
    return newPlates
  }

  const updateProductPricing = (id, pricing) => {
    setProducts(prev => prev.map(item => item.id === id ? {
      ...item,
      cost_price: Number(pricing.cost_price),
      sale_price: Number(pricing.sale_price),
      minimum_stock: Number(pricing.minimum_stock),
      pricing_configured: true
    } : item))
  }

  const updatePlate = (id, updatedData) => {
    setPlates(prev => prev.map(p => {
      if (p.id === id) {
        const isActivating = updatedData.status === 'active' && p.status !== 'active'
        return {
          ...p,
          ...updatedData,
          activated_at: isActivating ? new Date().toISOString().split('T')[0] : p.activated_at
        }
      }
      return p
    }))
  }

  // Sale operations
  const addSale = (saleData) => {
    const sale = {
      ...saleData,
      id: 'sl-' + Date.now(),
      number: String(sales.length + 54).padStart(5, '0'),
      sale_date: new Date().toISOString().split('T')[0],
      status: saleData.status || 'completed',
      payment_status: saleData.payment_status || 'paid'
    }
    setSales(prev => [sale, ...prev])

    // Update inventory movement
    const movement = {
      id: 'mov-' + Date.now(),
      type: 'exit',
      product_name: saleData.product_name || 'Venda de itens NFC',
      quantity: -(saleData.items_count || 1),
      reason: `Venda #${sale.number} (${sale.client_name})`,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      author: 'Sistema'
    }
    setInventoryMovements(prev => [movement, ...prev])

    return sale
  }

  // Inventory operations
  const addInventoryMovement = (movementData) => {
    const mov = {
      ...movementData,
      id: 'mov-' + Date.now(),
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      author: 'Admin'
    }
    setInventoryMovements(prev => [mov, ...prev])
  }

  return (
    <AppContext.Provider
      value={{
        organization,
        setOrganization,
        clients,
        addClient,
        updateClient,
        products,
        updateProductPricing,
        plates,
        addPlate,
        addPlateBatch,
        updatePlate,
        sales,
        addSale,
        inventoryMovements,
        addInventoryMovement,
        credentials,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within an AppProvider')
  return context
}
