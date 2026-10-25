-- O Craft Completo libera todos os recursos e remove os limites de uso.

create or replace function public.plan_level(p_organization_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case public.effective_plan_key(p_organization_id)
    when 'business' then 3
    when 'pro' then 3
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
    when 'pro' then null
    when 'starter' then case p_resource when 'users' then 1 when 'clients' then 50 when 'plates' then 200 end
    else case p_resource when 'users' then 1 when 'clients' then 5 when 'plates' then 10 end
  end;
$$;
