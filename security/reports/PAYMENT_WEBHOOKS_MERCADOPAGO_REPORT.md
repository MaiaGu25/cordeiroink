# Relatório de Auditoria de Segurança: PAYMENT_WEBHOOKS (MERCADO PAGO)

**Projeto:** Cordeiro Ink Hub (Next.js, Prisma, Supabase, Mercado Pago)  
**Data da Auditoria:** 23 de Outubro de 2026  
**Status Geral:** `HIGH`  

---

## 1. Resumo Executivo
Esta auditoria avaliou a robustez, tolerância a falhas, validação de integridade e idempotência do endpoint de webhook oficial do Mercado Pago ([`src/app/api/webhooks/mercadopago/route.ts`](file:///c:/maiacode/cordeiroink/src/app/api/webhooks/mercadopago/route.ts)), bem como a rota de criação de cobranças ([`src/app/api/checkout/route.ts`](file:///c:/maiacode/cordeiroink/src/app/api/checkout/route.ts)).

O webhook do Mercado Pago possui boa tolerância a falhas (não derruba a aplicação e responde HTTP 200 para evitar retry storm). Além disso, não confia cegamente no corpo do webhook, consultando a API oficial com token do servidor. No entanto, foram encontradas duas vulnerabilidades de alta prioridade: **falta de idempotência nas mutações de log/notas** e **risco de manipulação de valor cobrado (`transaction_amount`) no checkout**.

---

## 2. O que foi encontrado (Evidências e Trechos de Código)

### A. Risco Crítico de Manipulação de Valor no Checkout (`transaction_amount`)
- **Arquivo:** [`src/app/api/checkout/route.ts`](file:///c:/maiacode/cordeiroink/src/app/api/checkout/route.ts#L60-L110)
- **Status:** `HIGH`
- **Trecho:**
  ```typescript
  // Linhas 60-61 e 108-110:
  const { formData, orderId, orderNumber, description } = body;
  const { transaction_amount, payment_method_id, payer, token, installments, issuer_id } = formData;
  ...
  const paymentPayload: any = {
    transaction_amount: Number(parseFloat(String(transaction_amount)).toFixed(2)),
    description: paymentDescription,
    payment_method_id,
  ```
- **Risco:** O valor cobrado pelo Mercado Pago (`transaction_amount`) é recebido diretamente do navegador do usuário no corpo da requisição. Se for informado um `orderId` existente de R$ 350,00, o backend não confere se `transaction_amount === order.totalProducts + order.shippingCost`. Um atacante pode enviar `transaction_amount: 0.10`, pagar dez centavos, e o webhook subsequente marcará o pedido como `PAID` porque a transação de fato foi aprovada no Mercado Pago.

### B. Falta de Idempotência Total no Webhook (Mutações Repetidas)
- **Arquivo:** [`src/app/api/webhooks/mercadopago/route.ts`](file:///c:/maiacode/cordeiroink/src/app/api/webhooks/mercadopago/route.ts#L90-L135)
- **Status:** `MEDIUM`
- **Trecho:**
  ```typescript
  // Linhas 92-103:
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: OrderStatus.PAID,
      paidAt: order.paidAt || new Date(),
      paymentMethod: ...,
      notes: `${order.notes ? `${order.notes} | ` : ""}Pago via Mercado Pago (ID: ${paymentData.id})`,
    },
  });
  ...
  // Linhas 124-132:
  await prisma.auditLog.create({
    data: {
      action: "WEBHOOK_PAYMENT_APPROVED",
      entity: "ORDER",
      entityId: order.id,
      orderId: order.id,
      details: `Pagamento de R$ ... aprovado via Webhook Mercado Pago (ID: ${paymentData.id}, Status: ${status})`,
    },
  });
  ```
- **Risco:** O Mercado Pago pode disparar múltiplos webhooks para o mesmo evento de pagamento (retries, notificações de status intermediárias). Embora a tabela `FinancialTransaction` previna duplicidade checando `findFirst`, o campo `notes` concatena a string a cada entrega repetida e novos registros de `AuditLog` são gerados desnecessariamente.

### C. Ausência de Validação de Assinatura HMAC (`x-signature`)
- **Arquivo:** [`src/app/api/webhooks/mercadopago/route.ts`](file:///c:/maiacode/cordeiroink/src/app/api/webhooks/mercadopago/route.ts#L20-L40)
- **Status:** `LOW`
- **Contexto:** O Mercado Pago disponibiliza no cabeçalho `x-signature` um hash HMAC-SHA256 gerado a partir da chave secreta do webhook configurada no painel. O código atual não valida essa assinatura antes de chamar `payment.get({ id })`.
- **Atenuação:** O impacto é mitigado pelo fato de o endpoint nunca confiar nos dados enviados pelo remetente: ele sempre consulta a API oficial do Mercado Pago usando as credenciais do servidor. No entanto, validar a assinatura poupa requisições à API do Mercado Pago causadas por scanners e spammers.

---

## 3. O que já está seguro (Pontos Positivos)

1. **Consulta Ativa à API Oficial do Mercado Pago (Zero Trust no Payload Externo):**
   - O webhook não assume o status recebido no JSON como verdade. Em vez disso, extrai apenas o `paymentId` e executa:
     ```typescript
     const paymentData = await payment.get({ id: String(paymentId) });
     ```
   - Isso anula ataques de falsificação de payload em que um atacante envia `{ status: "approved" }`.
2. **Resiliência e Prevenção de Queda do Servidor:**
   - O bloco `try/catch` global garante que qualquer falha de banco de dados ou formato de JSON não resulte em HTTP 500 descontrolado, retornando `200 OK` estruturado para satisfazer o mecanismo de entrega do Mercado Pago.
3. **Idempotência Financeira Segura:**
   - Em [`src/app/api/webhooks/mercadopago/route.ts`](file:///c:/maiacode/cordeiroink/src/app/api/webhooks/mercadopago/route.ts#L106-L121), antes de criar a transação de entrada (`TransactionType.INCOME`), o sistema verifica se já existe uma transação para o `orderId`, evitando duplicidade contábil no financeiro.

---

## 4. Recomendações de Correção

1. **Revalidar o Valor no Checkout Server-Side:**
   - No arquivo `src/app/api/checkout/route.ts`, se `orderId` for informado, buscar o pedido no banco de dados e forçar:
     ```typescript
     const expectedAmount = Number((order.totalProducts + order.shippingCost).toFixed(2));
     paymentPayload.transaction_amount = expectedAmount;
     ```
     Impedindo qualquer discrepância ou manipulação de preço pelo navegador.
2. **Garantir Idempotência no Webhook:**
   - No início do processamento do status `"approved"`, verificar se o pedido já está pago:
     ```typescript
     if (order.status === OrderStatus.PAID && order.paidAt) {
       return NextResponse.json({ received: true, alreadyProcessed: true }, { status: 200 });
     }
     ```
3. **Validar o Cabeçalho `x-signature`:**
   - Caso `MERCADO_PAGO_WEBHOOK_SECRET` esteja configurado no `.env`, calcular o HMAC do timestamp + payload e verificar a autenticidade antes de invocar `payment.get()`.
