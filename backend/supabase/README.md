# Banco de dados Supabase

O cadastro e a identidade multi-tenant ficam nas migrations, aplicadas em ordem:

1. `20261001000100_users_and_registration.sql`: organizações, perfis, membros, trigger de cadastro e RLS.
2. `20261001000200_backfill_auth_users.sql`: recupera perfis e organizações de usuários Auth existentes sem alterar senhas.
3. `20261001000300_repair_existing_user_schema.sql`: completa colunas ausentes quando o projeto já tinha tabelas antigas.
4. `20261001000400_stripe_billing.sql`: adiciona assinaturas, faturas, webhooks idempotentes e RLS de cobrança.

## Aplicar no projeto remoto

1. Crie ou abra o projeto no Supabase.
2. No terminal, entre na pasta `backend`, autentique e vincule este repositório:

```powershell
Set-Location backend
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

Como alternativa, cole as migrations no SQL Editor do Supabase e execute-as na ordem indicada.

3. Na raiz do projeto, copie `.env.example` para `.env` e preencha apenas as variáveis públicas do Vite:

```env
VITE_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_OU_PUBLISHABLE
```

Nunca coloque `service_role`, senha do banco ou chave de criptografia em variável `VITE_*`.

4. Em Authentication > URL Configuration, cadastre as URLs local e de produção, incluindo:

```text
http://localhost:5173/reset-password
https://seu-dominio.com/reset-password
```

## O que estas migrations entregam

- criação automática da organização e do usuário owner no cadastro;
- perfil ligado ao usuário do Supabase Auth;
- vínculo em `organization_members`;
- funções `owner`, `admin`, `seller`, `operator` e `viewer`;
- isolamento por organização com Row Level Security;
- proteção contra autopromoção de função por usuários comuns;
- recuperação dos usuários Auth criados antes da instalação do trigger.

Sem `.env`, o sistema permanece na tela de login e bloqueia gravações. Não existe fallback que simule persistência local.
