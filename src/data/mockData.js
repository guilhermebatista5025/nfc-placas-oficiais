export const initialOrganization = {
  id: 'org-craft-01',
  name: 'Craft Evolution',
  slug: 'craft-evolution',
  plan: 'Plano Pro',
  logoUrl: null,
  email: 'contato@craftevolution.com.br',
  phone: '(27) 99876-5432'
}

export const initialClients = [
  {
    id: 'cli-01',
    name: 'Restaurante Villa Gourmet',
    responsible_name: 'Carlos Ferreira',
    email: 'carlos@villagourmet.com.br',
    phone: '(27) 99999-9999',
    document: '12.345.678/0001-90',
    business_segment: 'Gastronomia',
    city: 'Vila Velha',
    state: 'ES',
    address: 'Av. Hugo Musso, 1200 - Praia da Costa',
    notes: 'Cliente prioritário, adquiriu display de balcão e 3 placas.',
    status: 'active',
    created_at: '2026-02-15'
  },
  {
    id: 'cli-02',
    name: 'Barbearia Don Corleone',
    responsible_name: 'Lucas Martins',
    email: 'lucas@doncorleone.com',
    phone: '(27) 98888-1122',
    document: '98.765.432/0001-10',
    business_segment: 'Beleza & Estética',
    city: 'Vitória',
    state: 'ES',
    address: 'Rua das Palmeiras, 450 - Praia do Canto',
    notes: 'Foco em avaliações 5 estrelas na bancada dos barbeiros.',
    status: 'active',
    created_at: '2026-02-28'
  },
  {
    id: 'cli-03',
    name: 'Auto Center Imperial',
    responsible_name: 'Roberto Silveira',
    email: 'roberto@autocenterimperial.com.br',
    phone: '(27) 97777-3344',
    document: '45.123.789/0001-55',
    business_segment: 'Automotivo',
    city: 'Serra',
    state: 'ES',
    address: 'Rod. BR 101, Km 12',
    notes: 'Adesivo QR Code no checklist de entrega de veículos.',
    status: 'active',
    created_at: '2026-03-05'
  }
]

export const initialProducts = [
  {
    id: 'prod-01',
    name: 'Placa NFC Acrílico Google',
    sku: 'NFC-PL-ACR',
    description: 'Placa acrílica personalizada com chip NFC NTAG213 e QR Code gravado a laser.',
    cost_price: 18.50,
    sale_price: 89.90,
    minimum_stock: 20,
    current_stock: 42,
    active: true
  },
  {
    id: 'prod-02',
    name: 'Placa NFC Acrílico Instagram',
    sku: 'NFC-PL-INS',
    description: 'Placa acrílica com chip NFC e QR Code direcionados ao perfil do Instagram.',
    cost_price: 18.50,
    sale_price: 89.90,
    minimum_stock: 10,
    current_stock: 18,
    active: true
  },
  {
    id: 'prod-03',
    name: 'Cartão NFC de Bolso',
    sku: 'NFC-CRD-PVC',
    description: 'Cartão PVC tipo chaveiro ou carteira para coletar avaliações onde você for.',
    cost_price: 6.00,
    sale_price: 39.90,
    minimum_stock: 30,
    current_stock: 85,
    active: true
  },
  {
    id: 'prod-04',
    name: 'Adesivo Resinado NFC/QR',
    sku: 'NFC-ADS-RES',
    description: 'Adesivo resinado à prova d’água para mesas e balcões de alta circulação.',
    cost_price: 4.50,
    sale_price: 24.90,
    minimum_stock: 50,
    current_stock: 120,
    active: true
  }
]

export const initialPlates = [
  {
    id: 'plt-01',
    code: 'NFC-000001',
    serial_number: 'SN-NFC-78921',
    product_name: 'Placa NFC Acrílico Google',
    client_name: 'Restaurante Villa Gourmet',
    client_id: 'cli-01',
    status: 'active',
    google_review_url: 'https://g.page/r/Cdfg3-VillaGourmet/review',
    qr_code_url: 'https://craftnfc.com/r/NFC-000001',
    activated_at: '2026-02-18'
  },
  {
    id: 'plt-02',
    code: 'NFC-000002',
    serial_number: 'SN-NFC-78922',
    product_name: 'Display de Balcão NFC',
    client_name: 'Restaurante Villa Gourmet',
    client_id: 'cli-01',
    status: 'active',
    google_review_url: 'https://g.page/r/Cdfg3-VillaGourmet/review',
    qr_code_url: 'https://craftnfc.com/r/NFC-000002',
    activated_at: '2026-02-18'
  },
  {
    id: 'plt-03',
    code: 'NFC-000003',
    serial_number: 'SN-NFC-78923',
    product_name: 'Cartão NFC de Bolso',
    client_name: 'Barbearia Don Corleone',
    client_id: 'cli-02',
    status: 'configuring',
    google_review_url: 'https://g.page/r/BarbeariaDonCorleone/review',
    qr_code_url: 'https://craftnfc.com/r/NFC-000003',
    activated_at: null
  },
  {
    id: 'plt-04',
    code: 'NFC-000004',
    serial_number: 'SN-NFC-78924',
    product_name: 'Placa NFC Acrílico Google',
    client_name: 'Auto Center Imperial',
    client_id: 'cli-03',
    status: 'sold',
    google_review_url: '',
    qr_code_url: 'https://craftnfc.com/r/NFC-000004',
    activated_at: null
  },
  {
    id: 'plt-05',
    code: 'NFC-000005',
    serial_number: 'SN-NFC-78925',
    product_name: 'Display de Balcão NFC',
    client_name: null,
    client_id: null,
    status: 'in_stock',
    google_review_url: '',
    qr_code_url: 'https://craftnfc.com/r/NFC-000005',
    activated_at: null
  },
  {
    id: 'plt-06',
    code: 'NFC-000006',
    serial_number: 'SN-NFC-78926',
    product_name: 'Placa NFC Acrílico Google',
    client_name: null,
    client_id: null,
    status: 'in_stock',
    google_review_url: '',
    qr_code_url: 'https://craftnfc.com/r/NFC-000006',
    activated_at: null
  }
]

export const initialSales = [
  {
    id: 'sl-00053',
    number: '00053',
    client_name: 'Restaurante Villa Gourmet',
    client_id: 'cli-01',
    channel: 'WhatsApp',
    location: 'Loja Vila Velha',
    items_count: 2,
    subtotal: 219.80,
    discount: 19.80,
    total: 200.00,
    cost: 43.50,
    profit: 156.50,
    payment_method: 'Pix',
    payment_status: 'paid',
    status: 'completed',
    sale_date: '2026-03-20',
    plates_assigned: ['NFC-000001', 'NFC-000002']
  },
  {
    id: 'sl-00052',
    number: '00052',
    client_name: 'Barbearia Don Corleone',
    client_id: 'cli-02',
    channel: 'Instagram',
    location: 'Visita Comercial',
    items_count: 1,
    subtotal: 89.90,
    discount: 0,
    total: 89.90,
    cost: 18.50,
    profit: 71.40,
    payment_method: 'Cartão de Crédito',
    payment_status: 'paid',
    status: 'completed',
    sale_date: '2026-03-18',
    plates_assigned: ['NFC-000003']
  },
  {
    id: 'sl-00051',
    number: '00051',
    client_name: 'Auto Center Imperial',
    client_id: 'cli-03',
    channel: 'Indicação',
    location: 'Loja Vila Velha',
    items_count: 1,
    subtotal: 89.90,
    discount: 10.00,
    total: 79.90,
    cost: 18.50,
    profit: 61.40,
    payment_method: 'Pix',
    payment_status: 'paid',
    status: 'processing',
    sale_date: '2026-03-15',
    plates_assigned: ['NFC-000004']
  }
]

export const initialInventoryMovements = [
  {
    id: 'mov-01',
    type: 'entry',
    product_name: 'Placa NFC Acrílico Google',
    quantity: 50,
    reason: 'Lote de importação chip NTAG213',
    created_at: '2026-03-01 10:30',
    author: 'Admin'
  },
  {
    id: 'mov-02',
    type: 'exit',
    product_name: 'Placa NFC Acrílico Google',
    quantity: -1,
    reason: 'Venda #00053 (Villa Gourmet)',
    created_at: '2026-03-20 14:15',
    author: 'Vendedor Bruno'
  },
  {
    id: 'mov-03',
    type: 'exit',
    product_name: 'Display de Balcão NFC',
    quantity: -1,
    reason: 'Venda #00053 (Villa Gourmet)',
    created_at: '2026-03-20 14:15',
    author: 'Vendedor Bruno'
  },
  {
    id: 'mov-04',
    type: 'entry',
    product_name: 'Display de Balcão NFC',
    quantity: 20,
    reason: 'Reposição fornecedor acrílicos',
    created_at: '2026-03-10 09:00',
    author: 'Admin'
  }
]

export const initialCredentials = [
  {
    id: 'cred-01',
    client_id: 'cli-01',
    client_name: 'Restaurante Villa Gourmet',
    service: 'Google Business Profile',
    username: 'villagourmet.es@gmail.com',
    status: 'configured',
    last_verified: '2026-03-22',
    notes: 'Acesso para monitorar avaliações e sincronização de Place ID.'
  },
  {
    id: 'cred-02',
    client_id: 'cli-02',
    client_name: 'Barbearia Don Corleone',
    service: 'Google Place API',
    username: 'place_id_ChIJ_example982',
    status: 'active',
    last_verified: '2026-03-21',
    notes: 'Chave de busca de avaliações via Edge Function.'
  }
]
