-- Stripe Billing: assinaturas, faturas, conciliação por webhook e isolamento RLS.

alter table public.organizations
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_price_id text,
  add column if not exists billing_status text not null default 'inactive',
  add column if not exists billing_period_end timestamptz,
  add column if not exists billing_cancel_at_period_end boolean not null default false,
  add column if not exists billing_updated_at timestamptz;

alter table public.clients
  add column if not exists stripe_customer_id text;

create unique index if not exists organizations_stripe_customer_id_idx
  on public.organizations (stripe_customer_id)
  where stripe_customer_id is not null;

create unique index if not exists organizations_stripe_subscription_id_idx
  on public.organizations (stripe_subscription_id)
  where stripe_subscription_id is not null;

create unique index if not exists clients_stripe_customer_id_idx
  on public.clients (stripe_customer_id)
  where stripe_customer_id is not null;

create table if not exists public.billing_invoices (
  id text primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  stripe_customer_id text,
  status text,
  amount_due bigint not null default 0,
  amount_paid bigint not null default 0,
  currency text not null default 'brl',
  hosted_invoice_url text,
  invoice_pdf text,
  due_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_invoices_organization_created_idx
  on public.billing_invoices (organization_id, created_at desc);

create table if not exists public.stripe_webhook_events (
  id text primary key,
  type text not null,
  livemode boolean not null default false,
  status text not null default 'processing' check (status in ('processing', 'processed', 'failed')),
  last_error text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.billing_invoices enable row level security;
alter table public.stripe_webhook_events enable row level security;

drop policy if exists billing_invoices_select_same_tenant on public.billing_invoices;
create policy billing_invoices_select_same_tenant
on public.billing_invoices for select
to authenticated
using (organization_id = public.current_organization_id());

grant select on public.billing_invoices to authenticated;
revoke all on public.stripe_webhook_events from anon, authenticated;
grant all on public.billing_invoices, public.stripe_webhook_events to service_role;

comment on table public.stripe_webhook_events is
  'Controle privado e idempotente dos eventos Stripe processados pelo backend.';
