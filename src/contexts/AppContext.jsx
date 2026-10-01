import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getPlanEntitlements } from '@/config/plans'
import * as api from '@/services/appData'

const AppContext = createContext(null)

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
  const [data, setData] = useState(emptyData)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const organizationId = user?.organization_id
  const entitlements = useMemo(() => getPlanEntitlements(data.organization), [data.organization])
  const hasFeature = useCallback((feature) => entitlements.access.has(feature), [entitlements])

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
    if (!authLoading && !user) {
      setData(emptyData)
      setLoading(false)
    }
  }, [authLoading, user, isSupabaseConfigured, reload])

  const setOrganization = async (changes) => {
    if (!data.organization) return null
    requireBackend(isSupabaseConfigured)
    const saved = await api.patchOrganization(data.organization.id, {
      name: changes.name,
      email: changes.email,
      phone: changes.phone,
    })
    setData((current) => ({ ...current, organization: { ...saved, logoUrl: saved.logo_url } }))
    return saved
  }

  const addClient = async (newClient) => {
    requireBackend(isSupabaseConfigured)
    assertWithinLimit('clientes', data.clients.length, 1, entitlements.limits.clients)
    const client = await api.insertClient(organizationId, { ...newClient, status: 'active' })
    setData((current) => ({ ...current, clients: [client, ...current.clients] }))
    return client
  }

  const updateClient = async (id, changes) => {
    requireBackend(isSupabaseConfigured)
    const client = await api.patchClient(id, changes)
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
    requireBackend(isSupabaseConfigured)
    const product = await api.patchProduct(id, changes)
    setData((current) => ({ ...current, products: current.products.map((item) => item.id === id ? product : item) }))
    return product
  }

  const updatePlate = async (id, changes) => {
    const currentPlate = data.plates.find((item) => item.id === id)
    const activatedAt = changes.status === 'active' && currentPlate?.status !== 'active' ? new Date().toISOString() : undefined
    requireBackend(isSupabaseConfigured)
    const saved = await api.patchPlate(id, { ...changes, ...(activatedAt ? { activated_at: activatedAt } : {}) })
    const plate = { ...saved, product_name: saved.product?.name || '', client_name: saved.client?.name || null }
    setData((current) => ({ ...current, plates: current.plates.map((item) => item.id === id ? plate : item) }))
    return plate
  }

  const addPlateBatch = async ({ product, quantity, serialPrefix, destinationUrl = '', costPrice, salePrice, minimumStock }) => {
    requireBackend(isSupabaseConfigured)
    assertWithinLimit('placas', data.plates.length, Number(quantity), entitlements.limits.plates)
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
    requireBackend(isSupabaseConfigured)
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
    requireBackend(isSupabaseConfigured)
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
    entitlements,
    hasFeature,
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

function requireBackend(configured) {
  if (!configured) {
    throw new Error('Supabase não configurado. Nenhum dado foi salvo.')
  }
}

function assertWithinLimit(label, current, increment, limit) {
  if (limit === null) return
  if (current + increment > limit) {
    throw new Error(`Seu plano permite até ${limit} ${label}. Faça upgrade para continuar.`)
  }
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
