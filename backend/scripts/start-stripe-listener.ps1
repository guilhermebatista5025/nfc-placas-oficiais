$ErrorActionPreference = 'Stop'

$backendDirectory = Split-Path -Parent $PSScriptRoot
$environmentFile = Join-Path $backendDirectory '.env.stripe'

if (-not (Test-Path -LiteralPath $environmentFile)) {
    throw "Arquivo backend/.env.stripe não encontrado."
}

$secretKeyLine = Get-Content -LiteralPath $environmentFile |
    Where-Object { $_ -match '^STRIPE_SECRET_KEY=' } |
    Select-Object -First 1
$secretKey = ($secretKeyLine -replace '^STRIPE_SECRET_KEY=', '').Trim()

if (-not $secretKey) {
    throw "Preencha STRIPE_SECRET_KEY em backend/.env.stripe antes de iniciar o listener."
}

$events = @(
    'checkout.session.completed'
    'checkout.session.async_payment_succeeded'
    'checkout.session.async_payment_failed'
    'customer.subscription.created'
    'customer.subscription.updated'
    'customer.subscription.deleted'
    'invoice.created'
    'invoice.finalized'
    'invoice.paid'
    'invoice.payment_failed'
    'invoice.voided'
) -join ','

Set-Location -LiteralPath $backendDirectory
stripe listen `
    --api-key $secretKey `
    --forward-to 'http://127.0.0.1:3001/api/stripe/webhook' `
    --events $events
