-- Planos e entitlements autoritativos. A interface orienta; o banco impede bypass.

alter table public.organizations
  add column if not exists plan_key text not null default 'free';

alter table public.organizations
  drop constraint if exists organizations_plan_key_check;

alter table public.organizations
  add constraint organizations_plan_key_check
  check (plan_key in ('free', 'starter', 'pro', 'business'));

alter table public.organizations alter column plan set default 'Gratuito';

update public.organizations
set plan_key = case
  when billing_status in ('active', 'trialing', 'past_due') and lower(plan) like '%business%' then 'business'
  when billing_status in ('active', 'trialing', 'past_due') and lower(plan) like '%pro%' then 'pro'
  when billing_status in ('active', 'trialing', 'past_due') and lower(plan) like '%starter%' then 'starter'
  else 'free'
end;

create or replace function public.effective_plan_key(p_organization_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when o.billing_status in ('active', 'trialing', 'past_due')
      and o.plan_key in ('starter', 'pro', 'business')
      then o.plan_key
    else 'free'
  end
  from public.organizations o
  where o.id = p_organization_id;
$$;

create or replace function public.plan_level(p_organization_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case public.effective_plan_key(p_organization_id)
    when 'business' then 3
    when 'pro' then 2
    when 'starter' then 1
    else 0
  end;
$$;

create or replace function public.plan_limit(p_organization_id uuid, p_resource text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case public.effective_plan_key(p_organization_id)
    when 'business' then null
    when 'pro' then case p_resource when 'users' then 5 when 'clients' then 500 when 'plates' then 2000 end
    when 'starter' then case p_resource when 'users' then 1 when 'clients' then 50 when 'plates' then 200 end
    else case p_resource when 'users' then 1 when 'clients' then 5 when 'plates' then 10 end
  end;
$$;

create or replace function public.plan_has_feature(p_organization_id uuid, p_feature text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case p_feature
    when 'dashboard' then true
    when 'clients' then true
    when 'plates' then true
    when 'sales' then true
    when 'inventory' then true
    when 'finance' then public.plan_level(p_organization_id) >= 1
    when 'reports' then public.plan_level(p_organization_id) >= 2
    when 'credentials' then public.plan_level(p_organization_id) >= 2
    when 'team' then public.plan_level(p_organization_id) >= 2
    when 'business' then public.plan_level(p_organization_id) >= 3
    else false
  end;
$$;

create or replace function public.get_my_entitlements()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with context as (
    select public.current_organization_id() as organization_id
  )
  select jsonb_build_object(
    'planKey', public.effective_plan_key(context.organization_id),
    'limits', jsonb_build_object(
      'users', public.plan_limit(context.organization_id, 'users'),
      'clients', public.plan_limit(context.organization_id, 'clients'),
      'plates', public.plan_limit(context.organization_id, 'plates')
    ),
    'usage', jsonb_build_object(
      'users', (select count(*) from public.organization_members m where m.organization_id = context.organization_id and m.status = 'active'),
      'clients', (select count(*) from public.clients c where c.organization_id = context.organization_id),
      'plates', (select count(*) from public.plates p where p.organization_id = context.organization_id)
    )
  )
  from context;
$$;

create or replace function public.enforce_plan_resource_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_resource text;
  v_limit integer;
  v_usage bigint;
begin
  if tg_op = 'UPDATE' and new.organization_id = old.organization_id then
    if tg_table_name <> 'organization_members'
      or old.status = 'active'
      or coalesce(new.status, 'active') <> 'active' then
      return new;
    end if;
  end if;

  v_resource := case tg_table_name
    when 'clients' then 'clients'
    when 'plates' then 'plates'
    when 'organization_members' then 'users'
  end;

  if v_resource is null then return new; end if;
  v_limit := public.plan_limit(new.organization_id, v_resource);
  if v_limit is null then return new; end if;

  if v_resource = 'clients' then
    select count(*) into v_usage from public.clients where organization_id = new.organization_id;
  elsif v_resource = 'plates' then
    select count(*) into v_usage from public.plates where organization_id = new.organization_id;
  else
    select count(*) into v_usage from public.organization_members where organization_id = new.organization_id and status = 'active';
    if coalesce(new.status, 'active') <> 'active' then return new; end if;
  end if;

  if v_usage >= v_limit then
    raise exception using
      errcode = 'P0001',
      message = format('plan_limit_%s: seu plano permite até %s %s', v_resource, v_limit, v_resource);
  end if;

  return new;
end;
$$;

drop trigger if exists clients_enforce_plan_limit on public.clients;
create trigger clients_enforce_plan_limit
before insert or update of organization_id on public.clients
for each row execute function public.enforce_plan_resource_limit();

drop trigger if exists plates_enforce_plan_limit on public.plates;
create trigger plates_enforce_plan_limit
before insert or update of organization_id on public.plates
for each row execute function public.enforce_plan_resource_limit();

drop trigger if exists organization_members_enforce_plan_limit on public.organization_members;
create trigger organization_members_enforce_plan_limit
before insert or update of organization_id, status on public.organization_members
for each row execute function public.enforce_plan_resource_limit();

create or replace function public.enforce_credentials_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.plan_has_feature(new.organization_id, 'credentials') then
    raise exception using
      errcode = 'P0001',
      message = 'plan_feature_credentials: o Cofre de credenciais exige o plano Pro ou Business';
  end if;
  return new;
end;
$$;

drop trigger if exists credentials_enforce_plan on public.credentials;
create trigger credentials_enforce_plan
before insert or update on public.credentials
for each row execute function public.enforce_credentials_plan();

drop policy if exists credentials_plan_select_restrictive on public.credentials;
create policy credentials_plan_select_restrictive
on public.credentials as restrictive
for select to authenticated
using (public.plan_has_feature(organization_id, 'credentials'));

drop policy if exists credentials_plan_insert_restrictive on public.credentials;
create policy credentials_plan_insert_restrictive
on public.credentials as restrictive
for insert to authenticated
with check (public.plan_has_feature(organization_id, 'credentials'));

drop policy if exists credentials_plan_update_restrictive on public.credentials;
create policy credentials_plan_update_restrictive
on public.credentials as restrictive
for update to authenticated
using (public.plan_has_feature(organization_id, 'credentials'))
with check (public.plan_has_feature(organization_id, 'credentials'));

-- O navegador pode editar dados cadastrais, mas nunca o plano ou o status de cobrança.
revoke update on public.organizations from authenticated;
grant update (name, logo_url, email, phone, document, updated_at) on public.organizations to authenticated;

grant execute on function public.effective_plan_key(uuid) to authenticated, service_role;
grant execute on function public.plan_level(uuid) to authenticated, service_role;
grant execute on function public.plan_limit(uuid, text) to authenticated, service_role;
grant execute on function public.plan_has_feature(uuid, text) to authenticated, service_role;
grant execute on function public.get_my_entitlements() to authenticated, service_role;

comment on column public.organizations.plan_key is
  'Plano persistido pelo backend a partir dos webhooks Stripe; o plano efetivo também considera billing_status.';
