import { supabase } from '@/lib/supabase'

function unwrap(result) {
  if (result.error) throw result.error
  return result.data
}

export async function fetchAppData(organizationId) {
  const results = await Promise.all([
    supabase.from('organizations').select('*').eq('id', organizationId).single(),
    supabase.from('clients').select('*').order('created_at', { ascending: false }),
    supabase.from('products').select('*').eq('active', true).order('created_at'),
    supabase.from('plates').select('*, product:products(name), client:clients(name)').order('created_at', { ascending: false }),
    supabase.from('sales').select('*, client:clients(name), sale_items(quantity)').order('sale_date', { ascending: false }),
    supabase.from('inventory_movements').select('*, product:products(name), author:profiles(name)').order('created_at', { ascending: false }),
    supabase.from('credentials').select('*, client:clients(name)').order('created_at', { ascending: false }),
  ])

  const [organization, clients, products, plates, sales, inventoryMovements, credentials] = results.map(unwrap)
  return {
    organization: { ...organization, logoUrl: organization.logo_url },
    clients,
    products,
    plates: plates.map((plate) => ({ ...plate, product_name: plate.product?.name || '', client_name: plate.client?.name || null })),
    sales: sales.map((sale) => ({
      ...sale,
      number: String(sale.number).padStart(5, '0'),
      client_name: sale.client?.name || '',
      channel: sale.sale_channel,
      items_count: sale.sale_items?.reduce((total, item) => total + item.quantity, 0) || 0,
    })),
    inventoryMovements: inventoryMovements.map((movement) => ({
      ...movement,
      product_name: movement.product?.name || '',
      author: movement.author?.name || 'Sistema',
    })),
    credentials: credentials.map((credential) => ({ ...credential, client_name: credential.client?.name || '' })),
  }
}

export async function insertClient(organizationId, client) {
  return unwrap(await supabase.from('clients').insert({ ...client, organization_id: organizationId }).select().single())
}

export async function patchClient(id, changes) {
  return unwrap(await supabase.from('clients').update(changes).eq('id', id).select().single())
}

export async function patchOrganization(id, changes) {
  return unwrap(await supabase.from('organizations').update(changes).eq('id', id).select().single())
}

export async function patchProduct(id, changes) {
  return unwrap(await supabase.from('products').update(changes).eq('id', id).select().single())
}

export async function patchPlate(id, changes) {
  return unwrap(await supabase.from('plates').update(changes).eq('id', id).select('*, product:products(name), client:clients(name)').single())
}

export async function createPlateBatch(payload) {
  return unwrap(await supabase.rpc('create_plate_batch', {
    p_product_id: payload.productId,
    p_quantity: payload.quantity,
    p_serial_prefix: payload.serialPrefix,
    p_destination_url: payload.destinationUrl,
    p_cost_price: payload.costPrice,
    p_sale_price: payload.salePrice,
    p_minimum_stock: payload.minimumStock,
  }))
}

export async function createSale(payload) {
  return unwrap(await supabase.rpc('create_sale', {
    p_client_id: payload.clientId,
    p_items: payload.items,
    p_channel: payload.channel,
    p_location: payload.location,
    p_discount: payload.discount,
    p_payment_method: payload.paymentMethod,
    p_payment_status: payload.paymentStatus,
    p_reserve_hardware: payload.reserveHardware,
  }))
}

export async function insertInventoryMovement(organizationId, movement) {
  return unwrap(await supabase.from('inventory_movements').insert({ ...movement, organization_id: organizationId }).select().single())
}
