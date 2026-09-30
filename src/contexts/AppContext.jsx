import React, { createContext, useContext, useState } from 'react'
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

export function AppProvider({ children }) {
  const [organization, setOrganization] = useState(initialOrganization)
  const [clients, setClients] = useState(initialClients)
  const [products, setProducts] = useState(initialProducts)
  const [plates, setPlates] = useState(initialPlates)
  const [sales, setSales] = useState(initialSales)
  const [inventoryMovements, setInventoryMovements] = useState(initialInventoryMovements)
  const [credentials, setCredentials] = useState(initialCredentials)
  const [searchQuery, setSearchQuery] = useState('')

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
      status: 'completed',
      payment_status: 'paid'
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
        plates,
        addPlate,
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
