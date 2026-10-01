import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  initialOrganization,
  initialClients,
  initialProducts,
  initialPlates,
  initialSales,
  initialInventoryMovements,
  initialCredentials,
} from '@/data/mockData'
import { useAuth } from '@/contexts/AuthContext'
import * as api from '@/services/appData'

const AppContext = createContext(null)

const demoData = {
  organization: initialOrganization,
  clients: initialClients,
  products: initialProducts,
  plates: initialPlates,
  sales: initialSales,
  inventoryMovements: initialInventoryMovements,
  credentials: initialCredentials,
}

const emptyData = {
  organization: null,
  clients: [],
  products: [],
  plates: [],
  sales: [],
  inventoryMovements: [],
  credentials: [],
}

export function AppProvider({ children }) {
  const { user, loading: authLoading, isSupabaseConfigured } = useAuth()
  const [data, setData] = useState(isSupabaseConfigured ? emptyData : demoData)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const organizationId = user?.organization_id

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured || !organizationId) return
    setLoading(true)
    setError('')
    try {
      setData(await api.fetchAppData(organizationId))
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível carregar os dados do Supabase.')
    } finally {
      setLoading(false)
    }
  }, [isSupabaseConfigured, organizationId])

  useEffect(() => {
    if (!authLoading && user) reload()
    if (!authLoading && !user && isSupabaseConfigured) {
      setData(emptyData)
      setLoading(false)
    }
  }, [authLoading, user, isSupabaseConfigured, reload])

  const setOrganization = async (changes) => {
    if (!data.organization) return null
    if (!isSupabaseConfigured) {
      const next = { ...data.organization, ...changes }
      setData((current) => ({ ...current, organization: next }))
      return next
    }
    const saved = await api.patchOrganization(data.organization.id, {
      name: changes.name,
      email: changes.email,
      phone: changes.phone,
    })
    setData((current) => ({ ...current, organization: { ...saved, logoUrl: saved.logo_url } }))
    return saved
  }

  const addClient = async (newClient) => {
    const client = isSupabaseConfigured
      ? await api.insertClient(organizationId, { ...newClient, status: 'active' })
      : { ...newClient, id: `demo-client-${Date.now()}`, status: 'active', created_at: new Date().toISOString() }
    setData((current) => ({ ...current, clients: [client, ...current.clients] }))
    return client
  }

  const updateClient = async (id, changes) => {
    const client = isSupabaseConfigured
      ? await api.patchClient(id, changes)
      : { ...data.clients.find((item) => item.id === id), ...changes }
    setData((current) => ({ ...current, clients: current.clients.map((item) => item.id === id ? client : item) }))
    return client
  }

  const updateProductPricing = async (id, pricing) => {
    const changes = {
      cost_price: Number(pricing.cost_price),
      sale_price: Number(pricing.sale_price),
      minimum_stock: Number(pricing.minimum_stock),
      pricing_configured: true,
    }
    const product = isSupabaseConfigured
      ? await api.patchProduct(id, changes)
      : { ...data.products.find((item) => item.id === id), ...changes }
    setData((current) => ({ ...current, products: current.products.map((item) => item.id === id ? product : item) }))
    return product
  }

  const updatePlate = async (id, changes) => {
    const currentPlate = data.plates.find((item) => item.id === id)
    const activatedAt = changes.status === 'active' && currentPlate?.status !== 'active' ? new Date().toISOString() : undefined
    let plate
    if (isSupabaseConfigured) {
      const saved = await api.patchPlate(id, { ...changes, ...(activatedAt ? { activated_at: activatedAt } : {}) })
      plate = { ...saved, product_name: saved.product?.name || '', client_name: saved.client?.name || null }
    } else {
      plate = { ...currentPlate, ...changes, ...(activatedAt ? { activated_at: activatedAt } : {}) }
    }
    setData((current) => ({ ...current, plates: current.plates.map((item) => item.id === id ? plate : item) }))
    return plate
  }

  const addPlateBatch = async ({ product, quantity, serialPrefix, destinationUrl = '', costPrice, salePrice, minimumStock }) => {
    if (!isSupabaseConfigured) {
      const start = data.plates.length + 1
      const created = Array.from({ length: quantity }, (_, index) => {
        const code = `NFC-${String(start + index).padStart(6, '0')}`
        return {
          id: `demo-plate-${Date.now()}-${index}`,
          code,
          serial_number: `${serialPrefix || 'SN-NFC'}-${String(start + index).padStart(5, '0')}`,
          product_id: product.id,
          product_name: product.name,
          client_id: null,
          client_name: null,
          status: 'in_stock',
          google_review_url: destinationUrl,
          qr_code_url: `/r/${code}`,
          activated_at: null,
        }
      })
      setData((current) => ({
        ...current,
        plates: [...created, ...current.plates],
        products: current.products.map((item) => item.id === product.id ? {
          ...item,
          current_stock: Number(item.current_stock) + quantity,
          cost_price: Number(costPrice),
          sale_price: Number(salePrice),
          minimum_stock: Number(minimumStock),
        } : item),
      }))
      return created
    }
    const created = await api.createPlateBatch({
      productId: product.id,
      quantity,
      serialPrefix,
      destinationUrl,
      costPrice,
      salePrice,
      minimumStock,
    })
    await reload()
    return created
  }

  const addSale = async (saleData) => {
    if (!isSupabaseConfigured) {
      const sale = {
        ...saleData,
        id: `demo-sale-${Date.now()}`,
        number: String(data.sales.length + 1).padStart(5, '0'),
        sale_date: new Date().toISOString().slice(0, 10),
        status: 'completed',
      }
      setData((current) => ({ ...current, sales: [sale, ...current.sales] }))
      return sale
    }
    const sale = await api.createSale({
      clientId: saleData.client_id,
      items: saleData.items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
      channel: saleData.channel,
      location: saleData.location,
      discount: Number(saleData.discount || 0),
      paymentMethod: saleData.payment_method,
      paymentStatus: saleData.payment_status,
      reserveHardware: saleData.reserve_hardware,
    })
    await reload()
    return sale
  }

  const addInventoryMovement = async (movementData) => {
    if (!isSupabaseConfigured) {
      const movement = { ...movementData, id: `demo-movement-${Date.now()}`, created_at: new Date().toISOString(), author: 'Admin' }
      setData((current) => ({ ...current, inventoryMovements: [movement, ...current.inventoryMovements] }))
      return movement
    }
    const movement = await api.insertInventoryMovement(organizationId, movementData)
    await reload()
    return movement
  }

  const value = {
    ...data,
    loading,
    error,
    reload,
    setOrganization,
    addClient,
    updateClient,
    updateProductPricing,
    updatePlate,
    addPlateBatch,
    addSale,
    addInventoryMovement,
    searchQuery,
    setSearchQuery,
  }

  return (
    <AppContext.Provider value={value}>
      {loading
        ? <BackendState title="Carregando seus dados..." />
        : error
          ? <BackendState title="Falha ao conectar ao backend" detail={error} action={reload} />
          : children}
    </AppContext.Provider>
  )
}

function BackendState({ title, detail, action }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-slate-50 p-6 text-center">
      <div>
        <strong className="text-sm text-slate-900">{title}</strong>
        {detail && <p className="mt-2 max-w-sm text-xs text-rose-600">{detail}</p>}
        {action && <button type="button" onClick={action} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white">Tentar novamente</button>}
      </div>
    </div>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within an AppProvider')
  return context
}
