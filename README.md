# Craft NFC Manager

Plataforma SaaS para gerenciamento de placas NFC e QR Codes voltadas para avaliações no Google, permitindo controlar clientes, empresas, vendas, estoque, placas, credenciais, usuários, relatórios e operações em um único painel.

---

## Visão geral

O **Craft NFC Manager** é um sistema SaaS desenvolvido para empresas que trabalham com placas NFC, QR Codes e soluções de avaliação digital.

A plataforma permite que cada empresa cadastrada tenha seu próprio ambiente isolado, com seus respectivos:

- clientes;
- funcionários;
- produtos;
- placas NFC;
- QR Codes;
- vendas;
- estoque;
- credenciais;
- locais de venda;
- relatórios;
- configurações.

A arquitetura será preparada desde o início para funcionar como um sistema **multi-tenant**, permitindo futuramente comercializar a plataforma para outras empresas.

---

# Objetivo do projeto

Centralizar toda a operação relacionada à venda e gerenciamento de placas NFC.

O sistema deverá permitir acompanhar todo o ciclo de vida de uma placa:

```text
Estoque
   ↓
Venda
   ↓
Cliente
   ↓
Configuração
   ↓
Google Review URL
   ↓
QR Code
   ↓
NFC
   ↓
Ativação
   ↓
Acompanhamento
```

---

# Stack

## Front-end

- React
- Vite
- JavaScript
- React Router
- React Hook Form
- Zod
- Tailwind CSS
- shadcn/ui
- Lucide React

## Back-end

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Edge Functions
- Row Level Security

## Deploy

- Vercel

---

# Arquitetura SaaS

O sistema será baseado em uma arquitetura multiempresa.

Cada empresa que utiliza a plataforma será representada por uma organização.

```text
PLATAFORMA
│
├── Organização A
│   ├── Usuários
│   ├── Clientes
│   ├── Produtos
│   ├── Placas
│   ├── Vendas
│   └── Estoque
│
├── Organização B
│   ├── Usuários
│   ├── Clientes
│   ├── Produtos
│   ├── Placas
│   ├── Vendas
│   └── Estoque
│
└── Organização C
```

Nenhuma organização poderá visualizar informações de outra.

O isolamento será realizado através de:

- `organization_id`
- Supabase Auth
- Row Level Security
- políticas de acesso no PostgreSQL

---

# Estrutura principal

```text
Craft NFC Manager
│
├── Autenticação
│
├── Dashboard
│
├── Clientes
│
├── Vendas
│
├── Produtos
│
├── Placas NFC
│
├── QR Codes
│
├── Estoque
│
├── Credenciais
│
├── Locais
│
├── Financeiro
│
├── Relatórios
│
├── Usuários
│
├── Assinatura
│
├── Logs
│
└── Configurações
```

---

# Autenticação

O sistema utilizará o Supabase Auth.

Funcionalidades:

- login;
- logout;
- recuperação de senha;
- redefinição de senha;
- convite de usuários;
- gerenciamento de sessão;
- proteção de rotas.

Rotas públicas:

```text
/login

/register

/forgot-password

/reset-password
```

Rotas privadas:

```text
/app/*
```

---

# Organizações

Tabela:

```text
organizations
```

Estrutura:

```text
id

name

slug

logo_url

email

phone

document

status

plan_id

created_at

updated_at
```

Exemplo:

```text
Craft Evolution

craft-evolution

Plano Pro
```

---

# Usuários

Tabela:

```text
profiles
```

Campos:

```text
id

organization_id

name

email

avatar_url

role

status

created_at

updated_at
```

Tipos de usuários:

```text
owner
admin
seller
operator
viewer
```

---

# Permissões

## Owner

Pode acessar tudo.

```text
Dashboard

Clientes

Vendas

Produtos

Estoque

Placas

Credenciais

Relatórios

Financeiro

Usuários

Assinatura

Configurações
```

## Admin

Pode administrar a operação.

## Seller

Pode acessar:

```text
Clientes

Vendas

Produtos

Placas
```

## Operator

Pode acessar:

```text
Placas

QR Codes

Estoque
```

## Viewer

Somente leitura.

---

# Dashboard

O dashboard apresentará uma visão geral da organização.

KPIs:

```text
Receita

Lucro

Vendas

Clientes

Placas vendidas

Placas ativas

Placas em estoque
```

Exemplo:

```text
┌────────────────┐
│ Receita        │
│ R$ 12.450      │
│ +14%           │
└────────────────┘

┌────────────────┐
│ Vendas         │
│ 84             │
└────────────────┘

┌────────────────┐
│ Placas         │
│ 148            │
└────────────────┘

┌────────────────┐
│ Estoque        │
│ 42             │
└────────────────┘
```

---

# Clientes

Tabela:

```text
clients
```

Campos:

```text
id

organization_id

name

responsible_name

email

phone

document

business_segment

city

state

address

notes

status

created_at

updated_at
```

---

# Página do cliente

Cada cliente terá uma página individual.

Exemplo:

```text
Restaurante Villa Gourmet

Responsável
Carlos Ferreira

Telefone
(27) 99999-9999

Cidade
Vila Velha - ES
```

Abas:

```text
Informações

Placas

Vendas

Credenciais

Histórico
```

---

# Produtos

Tabela:

```text
products
```

Campos:

```text
id

organization_id

name

sku

description

cost_price

sale_price

minimum_stock

active

created_at

updated_at
```

Exemplos:

```text
Placa NFC Google

Cartão NFC

Display NFC

Adesivo QR Code

Tag NFC
```

---

# Placas NFC

Cada placa terá um identificador único.

Exemplo:

```text
NFC-000001

NFC-000002

NFC-000003
```

Tabela:

```text
plates
```

Campos:

```text
id

organization_id

client_id

sale_id

product_id

code

serial_number

qr_code_url

google_review_url

nfc_url

status

activated_at

created_at

updated_at
```

---

# Status das placas

```text
in_stock

reserved

sold

configuring

active

disabled
```

Interface:

```text
● Em estoque

● Reservada

● Vendida

● Configurando

● Ativa

● Desativada
```

---

# QR Codes

Cada placa poderá possuir um QR Code associado.

Fluxo:

```text
Google Review URL
        ↓
Sistema recebe URL
        ↓
Geração do QR Code
        ↓
QR associado à placa
        ↓
QR + NFC apontam para o mesmo destino
```

Tabela:

```text
qr_codes
```

Campos:

```text
id

organization_id

plate_id

destination_url

qr_image_url

created_at
```

---

# Vendas

Tabela:

```text
sales
```

Campos:

```text
id

organization_id

client_id

seller_id

location_id

sale_channel

subtotal

discount

total

cost

profit

payment_method

payment_status

status

sale_date

notes

created_at

updated_at
```

---

# Itens da venda

Tabela:

```text
sale_items
```

Campos:

```text
id

sale_id

product_id

quantity

unit_price

subtotal
```

Exemplo:

```text
Venda #00053

2 Placas NFC

1 Display NFC

3 Adesivos QR
```

---

# Fluxo da venda

```text
Selecionar cliente
        ↓
Selecionar produtos
        ↓
Quantidade
        ↓
Preço
        ↓
Desconto
        ↓
Pagamento
        ↓
Confirmar venda
        ↓
Movimentar estoque
        ↓
Selecionar placas
        ↓
Configurar
        ↓
Ativar
```

---

# Locais de venda

Tabela:

```text
sales_locations
```

Campos:

```text
id

organization_id

name

city

state

address

notes
```

Exemplos:

```text
Loja Vila Velha

Feira empresarial

Evento

Visita comercial
```

---

# Canal da venda

Além do local físico, será armazenado o canal da venda.

Exemplos:

```text
WhatsApp

Instagram

Indicação

Site

Loja física

Evento

Prospecção
```

---

# Estoque

O estoque será baseado em movimentações.

Tabela:

```text
inventory_movements
```

Campos:

```text
id

organization_id

product_id

type

quantity

reason

sale_id

created_by

created_at
```

Tipos:

```text
entry

exit

adjustment

return
```

Exemplo:

```text
+100

Entrada de novas placas


-5

Venda #00042


+1

Devolução
```

O estoque atual será calculado através das movimentações.

---

# Financeiro

Informações principais:

```text
Receita

Custos

Lucro

Ticket médio

Margem

Vendas por período
```

Exemplo:

```text
Receita

R$ 15.800


Custos

R$ 4.200


Lucro

R$ 11.600


Margem

73,41%
```

---

# Credenciais

Alguns clientes podem possuir credenciais relacionadas aos serviços utilizados.

Exemplos:

```text
Google Business

APIs

Tokens

Integrações
```

Tabela conceitual:

```text
credentials
```

Campos:

```text
id

organization_id

client_id

service

username

encrypted_secret

notes

created_at

updated_at
```

Nunca armazenar senhas em texto simples.

Nunca usar:

```text
password = "123456"
```

Os dados sensíveis devem ser criptografados.

Também devem existir:

- controle de acesso;
- registros de visualização;
- logs;
- Edge Functions;
- proteção por RLS.

---

# Logs

Tabela:

```text
audit_logs
```

Campos:

```text
id

organization_id

user_id

action

entity

entity_id

old_data

new_data

ip_address

created_at
```

Exemplo:

```text
Usuário:
Bruno

Ação:
Atualizou placa

Registro:
NFC-000124

Campo:
google_review_url
```

---

# Pesquisa global

O sistema deverá possuir pesquisa no topo.

Exemplo:

```text
Buscar clientes, placas, vendas...
```

Permitindo pesquisar:

```text
NFC-00234

Restaurante XPTO

VENDA-0021
```

---

# Notificações

O sistema poderá gerar alertas como:

```text
Estoque baixo

Pagamento pendente

Placa aguardando configuração

Placa aguardando ativação

Nova venda

Nova organização

Assinatura próxima do vencimento
```

---

# SaaS

Como plataforma SaaS, o sistema possuirá gerenciamento de assinatura.

Tabela:

```text
plans
```

Campos:

```text
id

name

price

billing_cycle

max_users

max_clients

max_plates

features

active
```

---

# Planos

Exemplo inicial:

## Starter

```text
1 usuário

50 clientes

200 placas

Dashboard básico

Gestão de clientes

Gestão de vendas
```

## Pro

```text
5 usuários

500 clientes

2.000 placas

Relatórios

Financeiro

Credenciais

Logs
```

## Business

```text
Usuários personalizados

Clientes ilimitados

Placas ilimitadas

Permissões avançadas

Suporte prioritário

Integrações
```

---

# Assinaturas

Tabela:

```text
subscriptions
```

Campos:

```text
id

organization_id

plan_id

provider

provider_subscription_id

status

current_period_start

current_period_end

cancel_at_period_end

created_at
```

Status:

```text
trial

active

past_due

cancelled

expired
```

---

# Trial

O sistema poderá oferecer período de teste.

Exemplo:

```text
14 dias gratuitos
```

Fluxo:

```text
Cadastro
   ↓
Criar organização
   ↓
Trial
   ↓
Uso da plataforma
   ↓
Escolher plano
   ↓
Pagamento
   ↓
Assinatura ativa
```

---

# Onboarding

Ao criar a conta:

```text
1. Criar conta

2. Criar empresa

3. Informar dados da empresa

4. Criar primeiro produto

5. Cadastrar estoque

6. Cadastrar primeiro cliente

7. Registrar primeira venda
```

---

# Banco de dados

Estrutura inicial:

```text
organizations

profiles

organization_members

plans

subscriptions

clients

products

plates

qr_codes

sales

sale_items

sales_locations

inventory_movements

credentials

audit_logs

notifications

settings
```

---

# Relacionamentos

```text
organizations
│
├── profiles
│
├── clients
│   │
│   ├── credentials
│   ├── plates
│   └── sales
│
├── products
│   │
│   └── inventory_movements
│
├── sales
│   │
│   └── sale_items
│
├── plates
│   │
│   └── qr_codes
│
├── subscriptions
│
├── notifications
│
└── audit_logs
```

---

# Segurança

A segurança será prioridade.

## Supabase RLS

Todas as principais tabelas deverão possuir:

```text
organization_id
```

O usuário somente poderá acessar registros pertencentes à organização da qual faz parte.

Exemplo conceitual:

```text
Usuário
   ↓
organization_members
   ↓
organization_id
   ↓
dados permitidos
```

---

# Proteção de secrets

Nunca armazenar no frontend:

```text
SUPABASE_SERVICE_ROLE_KEY

tokens privados

senhas

chaves de API privadas
```

Somente variáveis públicas poderão utilizar:

```text
VITE_
```

Secrets privados deverão permanecer no backend.

---

# Variáveis de ambiente

Exemplo:

```env
VITE_SUPABASE_URL=

VITE_SUPABASE_ANON_KEY=
```

Variáveis privadas:

```env
SUPABASE_SERVICE_ROLE_KEY=

ENCRYPTION_KEY=

PAYMENT_WEBHOOK_SECRET=
```

As privadas nunca devem ser expostas no navegador.

---

# Estrutura React

```text
src/
│
├── assets/
│
├── components/
│   │
│   ├── ui/
│   ├── forms/
│   ├── tables/
│   ├── charts/
│   ├── feedback/
│   └── layout/
│
├── pages/
│   │
│   ├── auth/
│   ├── dashboard/
│   ├── clients/
│   ├── sales/
│   ├── products/
│   ├── plates/
│   ├── inventory/
│   ├── credentials/
│   ├── reports/
│   ├── team/
│   ├── billing/
│   └── settings/
│
├── services/
│
├── hooks/
│
├── contexts/
│
├── utils/
│
├── constants/
│
├── validations/
│
├── routes/
│
├── lib/
│
├── App.jsx
│
└── main.jsx
```

---

# Components

Componentes reutilizáveis:

```text
Button

Input

Textarea

Select

Checkbox

Radio

Switch

Modal

Drawer

Dialog

AlertDialog

Card

StatCard

DataTable

Badge

Avatar

DropdownMenu

Tabs

SearchInput

DatePicker

Pagination

EmptyState

LoadingState

ErrorState

Toast
```

---

# Rotas

```text
/

 /login

 /register


/app

/app/dashboard

/app/clients

/app/clients/new

/app/clients/:id

/app/products

/app/sales

/app/sales/new

/app/sales/:id

/app/plates

/app/plates/:id

/app/inventory

/app/credentials

/app/reports

/app/team

/app/billing

/app/settings
```

---

# Layout

Desktop:

```text
┌─────────────────────────────────────────────┐
│ SIDEBAR │ HEADER                            │
│         │                                   │
│ Logo    │ Busca                    Perfil   │
│         │                                   │
│ Home    │                                   │
│ Clientes│            Conteúdo               │
│ Vendas  │                                   │
│ Placas  │                                   │
│ Estoque │                                   │
│ Reports │                                   │
│         │                                   │
│ Config  │                                   │
└─────────────────────────────────────────────┘
```

Sidebar:

```text
260px
```

Minimizada:

```text
72px
```

---

# Design System

## Cores

Background:

```text
#F7F8FA
```

Surface:

```text
#FFFFFF
```

Primary:

```text
#2563EB
```

Primary Dark:

```text
#1D4ED8
```

Text:

```text
#111827
```

Secondary Text:

```text
#667085
```

Border:

```text
#E5E7EB
```

Success:

```text
#16A34A
```

Warning:

```text
#F59E0B
```

Danger:

```text
#DC2626
```

---

# Tipografia

## Poppins

Utilizar em:

```text
Títulos

KPIs

Headings

Números importantes
```

## Inter

Utilizar em:

```text
Textos

Inputs

Tabelas

Labels

Descrição
```

---

# Hierarquia

```text
H1

32px
600


H2

24px
600


H3

18px
600


Body

14px - 16px


Small

12px - 13px
```

---

# Cards

```text
border-radius: 16px

border: 1px solid #EAECF0

background: #FFFFFF

padding: 24px
```

Visual:

```text
clean

minimalista

tecnológico

administrativo
```

Evitar excesso de:

```text
gradientes

glassmorphism

sombras pesadas

animações exageradas
```

---

# Experiência do usuário

O sistema deverá priorizar:

```text
Velocidade

Simplicidade

Clareza

Poucos cliques

Informações rápidas

Busca eficiente

Feedback visual
```

---

# Responsividade

Breakpoints:

```text
Mobile

Tablet

Desktop
```

No mobile:

```text
Sidebar
↓
Drawer
```

Tabelas poderão virar:

```text
Cards
```

---

# MVP

## Fase 1

```text
Auth

Organizações

Dashboard

Clientes

Produtos

Vendas

Placas

Estoque
```

---

## Fase 2

```text
QR Codes

Financeiro

Relatórios

Credenciais

Logs
```

---

## Fase 3

```text
Usuários

Permissões

Assinaturas

Planos

Notificações
```

---

## Fase 4

```text
Integrações

Automação

API pública

Webhooks

Dashboard avançado
```

---

# Possíveis integrações futuras

```text
Google Business Profile

WhatsApp

Mercado Pago

Stripe

Asaas

Resend

Twilio

Zapier

Make

n8n
```

---

# Fluxo geral

```text
USUÁRIO
   │
   ▼
REACT
   │
   ▼
SUPABASE AUTH
   │
   ▼
ORGANIZAÇÃO
   │
   ├── Clientes
   ├── Produtos
   ├── Vendas
   ├── Estoque
   ├── Placas
   ├── QR Codes
   └── Relatórios
   │
   ▼
POSTGRESQL
```

---

# Princípios do projeto

## 1. Multi-tenant desde o início

Toda informação operacional deverá pertencer a uma organização.

## 2. Segurança no banco

Nunca confiar exclusivamente no frontend.

## 3. Histórico em vez de exclusão

Operações importantes deverão possuir registro histórico.

## 4. Componentes reutilizáveis

Evitar duplicação de interface.

## 5. Escalabilidade

Construir o MVP sem impedir crescimento futuro.

## 6. Interface simples

Mesmo contendo muitas funcionalidades, o sistema deve continuar fácil de utilizar.

---

# Nome inicial

```text
Craft NFC Manager
```

Possíveis nomes futuros:

```text
Craft Reviews

Craft NFC

Craft Flow

Craft Hub

ReviewFlow

TapReview

TapFlow
```

---

# Objetivo final

Transformar o Craft NFC Manager em uma plataforma SaaS capaz de controlar todo o processo de venda e operação de produtos NFC.

```text
Lead
  ↓
Cliente
  ↓
Venda
  ↓
Produto
  ↓
Estoque
  ↓
Placa NFC
  ↓
QR Code
  ↓
Google Reviews
  ↓
Financeiro
  ↓
Relatórios
```

O sistema deverá ser desenvolvido inicialmente para uso interno da Craft Evolution, mantendo arquitetura preparada para comercialização futura como SaaS para terceiros.