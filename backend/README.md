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

## Banco

Consulte [supabase/README.md](supabase/README.md) para aplicar a migration.

O `.env.example` da raiz contém somente as chaves públicas exigidas pelo Vite. Chaves privadas pertencem exclusivamente ao `backend/.env`.
