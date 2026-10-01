# Banco de dados Supabase

O banco do MVP fica em `migrations/20260930000100_initial_backend.sql`.

## Aplicar no projeto remoto

1. Crie ou abra o projeto no Supabase.
2. No terminal, entre na pasta `backend`, autentique e vincule este repositório:

```powershell
Set-Location backend
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db push
```

Como alternativa, cole a migration completa no SQL Editor do Supabase e execute uma única vez.

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

## O que a migration entrega

- criação automática da organização e do usuário owner no cadastro;
- isolamento multi-tenant com RLS em todas as tabelas operacionais;
- clientes, produtos, placas, vendas, itens e estoque persistidos;
- entrada de lote e venda executadas em transações no PostgreSQL;
- saldo de estoque protegido contra valores negativos;
- log de alterações;
- metadados de credenciais separados dos secrets, que ficam no schema privado;
- quatro produtos iniciais para cada nova organização.

Sem `.env`, o front abre em modo demonstração somente em memória. Nenhum dado desse modo sobrevive a um recarregamento.
