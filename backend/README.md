# Backend do Craft NFC Manager

Esta pasta concentra tudo que não pertence à interface React:

```text
backend/
├── src/                 servidor Node e configuração privada
├── supabase/            banco, RLS, funções e migrations
├── .env                 variáveis privadas locais (ignorado pelo Git)
├── .env.example         modelo seguro das variáveis privadas
└── package.json         comandos do servidor
```

## Servidor local

Na raiz do projeto:

```powershell
npm run dev:backend
```

Saúde do serviço:

```text
GET http://127.0.0.1:3001/api/health
```

O servidor é o lugar reservado para operações que precisem de `service_role`, criptografia ou webhooks. O CRUD comum usa o cliente Supabase autenticado e permanece protegido por RLS.

## Stripe (modo de teste)

A integração usa Checkout hospedado, Portal do Cliente, Invoicing, Tax opcional e webhooks idempotentes. As rotas privadas validam o token Supabase e aceitam gerenciamento apenas por `owner` ou `admin`.

1. Execute a migration `supabase/migrations/20261001000400_stripe_billing.sql` no SQL Editor.
2. Revogue a chave secreta que foi compartilhada em conversa e gere uma chave restrita de teste (`rk_test_...`) com acesso mínimo a Customers, Checkout Sessions, Subscriptions, Customer Portal, Invoices, Invoice Items e leitura de Prices.
3. Preencha a chave restrita em `backend/.env.stripe`:

```text
STRIPE_SECRET_KEY=<cole aqui a nova chave restrita de teste>
```

4. Para webhooks locais, execute o Stripe CLI apontando para o backend e copie o segredo `whsec_...` retornado:

```powershell
stripe listen --forward-to http://127.0.0.1:3001/api/stripe/webhook
```

```text
STRIPE_WEBHOOK_SECRET=whsec_segredo_local
```

5. Reinicie o backend após alterar variáveis de ambiente.

O Stripe Tax começa desativado para evitar cobranças incorretas. Depois de configurar endereço de origem, categoria fiscal e registros no Dashboard Stripe, altere `STRIPE_AUTOMATIC_TAX_ENABLED=true`.

Rotas disponíveis:

- `GET /api/billing/summary`
- `POST /api/billing/checkout`
- `POST /api/billing/portal`
- `POST /api/billing/invoices`
- `POST /api/stripe/webhook`

## Banco

Consulte [supabase/README.md](supabase/README.md) para aplicar a migration.

O `.env.example` da raiz contém somente as chaves públicas exigidas pelo Vite. Chaves privadas pertencem exclusivamente ao `backend/.env`.
