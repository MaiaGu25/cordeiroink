# Relatório de Auditoria de Segurança: DATABASE_ACCESS & RLS

**Projeto:** Cordeiro Ink Hub (Next.js, Prisma, Supabase, Mercado Pago)  
**Data da Auditoria:** 23 de Outubro de 2026  
**Status Geral:** `HIGH`  

---

## 1. Resumo Executivo
Esta auditoria avaliou como o banco de dados PostgreSQL (hospedado no Supabase) é acessado pelo backend e se os dados de clientes, pedidos, itens e finanças estão expostos a leituras ou modificações anônimas diretas.

O projeto utiliza o Prisma ORM no servidor com conexão direta como superusuário (`postgres`), mas o Supabase também expõe a API PostgREST pública associada à `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Como as tabelas foram criadas diretamente via Prisma sem scripts explícitos de habilitação de Row Level Security (RLS), **as tabelas do schema public podem estar expostas à leitura pública via PostgREST direto no Supabase**, além de vulnerabilidades de autorização em Server Actions e manipulação de preço na criação de pedidos.

---

## 2. O que foi encontrado (Evidências e Trechos de Código)

### A. Risco de Exposição de Tabelas do Prisma no PostgREST do Supabase (Sem RLS Ativo)
- **Arquivo:** [`prisma/schema.prisma`](file:///c:/maiacode/cordeiroink/prisma/schema.prisma)
- **Status:** `HIGH`
- **Contexto:**
  - O aplicativo publica no navegador do cliente:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - As tabelas (`Order`, `OrderItem`, `User`, `AuditLog`, `FinancialTransaction`, `RawItem`, etc.) foram geradas no schema `public` via Prisma (`prisma db push`).
  - No PostgreSQL / Supabase, por padrão, se uma tabela é criada sem executar `ALTER TABLE "..." ENABLE ROW LEVEL SECURITY;`, a API REST nativa do Supabase (`https://<ref>.supabase.co/rest/v1/Order`) pode permitir que qualquer usuário anônimo portando a chave `anon` consulte dados cadastrais inteiros (nomes de clientes, telefones, e-mails, endereços, faturamento e logs de auditoria).
- **Risco:** Vazamento de dados em conformidade com LGPD (endereço residencial, telefone, pedidos e faturamento).

### B. Enumeração Pública de Pedidos na Rota de Status
- **Arquivo:** [`src/app/api/orders/[id]/status/route.ts`](file:///c:/maiacode/cordeiroink/src/app/api/orders/%5Bid%5D/status/route.ts#L26-L44)
- **Status:** `MEDIUM`
- **Trecho:**
  ```typescript
  // Linhas 26-33:
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: decodedId },
        { orderNumber: decodedId },
        { orderNumber: decodedId.startsWith("#") ? decodedId : `#${decodedId}` },
      ],
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentMethod: true,
      totalProducts: true,
      shippingCost: true,
      paidAt: true,
      updatedAt: true,
    },
  });
  ```
- **Risco:** Como a rota aceita `orderNumber` sequencial (ex: `#WPP-1001`, `#CI-1001`), um atacante pode iterar números de pedidos e descobrir o total cobrado, status de pagamento e volume de vendas da empresa. Embora dados de PII (nome, telefone) não sejam retornados nessa rota, a existência e os valores dos pedidos são enumeráveis.

### C. Server Actions Administrativas sem Validação de Sessão
- **Arquivo:** [`src/actions/orders.ts`](file:///c:/maiacode/cordeiroink/src/actions/orders.ts#L8-L54)
- **Status:** `HIGH`
- **Trecho:**
  ```typescript
  // Linhas 8-54:
  export async function getOrders(filter?: { ... }) {
    // Nenhuma validação de sessão ou getCurrentUser() é executada antes da consulta
    return await prisma.order.findMany({
      where,
      include: {
        items: true,
        productionJob: true,
        auditLogs: true,
      },
    });
  }
  ```
- **Risco:** Server Actions com `"use server"` geram endpoints RPC acessíveis via HTTP POST. Um invasor que invoque a Server Action diretamente pode baixar todos os pedidos da base de dados sem estar autenticado no painel.

### D. Manipulação de Preço Unitário no Checkout da Vitrine (Client-Side Price Tampering)
- **Arquivo:** [`src/actions/storefront.ts`](file:///c:/maiacode/cordeiroink/src/actions/storefront.ts#L395-L400)
- **Status:** `HIGH`
- **Trecho:**
  ```typescript
  // Linhas 395-400:
  const subtotal = data.items.reduce(
    (acc, i) => acc + Number(i.price) * Math.max(1, Number(i.quantity) || 1),
    0
  );
  const shippingCost = Number(data.shippingPrice) || 0;
  const grandTotal = subtotal + shippingCost;
  ```
- **Risco:** O preço unitário do item (`i.price`) e o frete (`data.shippingPrice`) são aceitos diretamente do payload enviado pelo cliente, sem revalidação contra o preço registrado na tabela `CatalogItem` ou `RawItem`. Um usuário técnico pode forjar a requisição e submeter um pedido com camiseta a R$ 1,00.

---

## 3. O que já está seguro (Pontos Positivos)

1. **Uso de Prepared Statements no Prisma:**
   - Todas as operações de banco utilizam o Prisma Client, que parametriza consultas e elimina vetores clássicos de SQL Injection.
2. **Projeção Estrita na API de Status:**
   - A rota [`src/app/api/orders/[id]/status/route.ts`](file:///c:/maiacode/cordeiroink/src/app/api/orders/%5Bid%5D/status/route.ts#L34-L44) utiliza cláusula `select` explícita, nunca retornando `customerName`, `customerEmail`, `customerPhone` ou `shippingAddress`.
3. **Controle de Estoque Atômico na Criação de Pedido:**
   - [`src/actions/storefront.ts`](file:///c:/maiacode/cordeiroink/src/actions/storefront.ts#L363-L392) valida se há estoque físico antes de salvar o pedido, evitando pedidos fantasmas sem insumo base.

---

## 4. Recomendações de Correção

1. **Ativar RLS em Todas as Tabelas no Supabase SQL Editor:**
   - Executar script SQL no Supabase para isolar o schema PostgREST de acessos anônimos:
     ```sql
     -- Habilita RLS em todas as tabelas operacionais
     ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
     ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
     ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
     ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
     ALTER TABLE "FinancialTransaction" ENABLE ROW LEVEL SECURITY;
     ALTER TABLE "RawItem" ENABLE ROW LEVEL SECURITY;
     ALTER TABLE "ProductionJob" ENABLE ROW LEVEL SECURITY;
     ALTER TABLE "PurchaseOrder" ENABLE ROW LEVEL SECURITY;
     ALTER TABLE "PurchaseOrderItem" ENABLE ROW LEVEL SECURITY;
     ALTER TABLE "Supplier" ENABLE ROW LEVEL SECURITY;

     -- Garante que a API PostgREST (anon) não tenha acesso direto
     -- O Prisma continuará funcionando normalmente pois conecta como 'postgres' (bypass RLS)
     ```
2. **Exigir Autenticação em Server Actions Administrativas:**
   - No início de `getOrders()`, `getHistoricalOrders()`, `getFinanceOverview()` e demais ações do ERP, validar a sessão via `await getCurrentUser()` e rejeitar se não for operador autenticado.
3. **Revalidação de Preço no Backend:**
   - Em `createStorefrontOrder`, buscar o item no `CatalogItem` pelo ID e utilizar o `catalogItem.price` do banco para calcular o subtotal, ignorando valores arbitrários enviados pelo frontend.
