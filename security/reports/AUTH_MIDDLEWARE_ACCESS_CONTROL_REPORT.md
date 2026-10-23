# Relatório de Auditoria de Segurança: AUTH_MIDDLEWARE & ACCESS_CONTROL

**Projeto:** Cordeiro Ink Hub (Next.js, Prisma, Supabase, Mercado Pago)  
**Data da Auditoria:** 23 de Outubro de 2026  
**Status Geral:** `CRITICAL`  

---

## 1. Resumo Executivo
Foi realizada uma análise abrangente do middleware Next.js ([`src/middleware.ts`](file:///c:/maiacode/cordeiroink/src/middleware.ts)), do middleware do Supabase Auth ([`src/lib/supabase/middleware.ts`](file:///c:/maiacode/cordeiroink/src/lib/supabase/middleware.ts)), de todas as páginas da aplicação e dos Route Handlers de API (`src/app/api/*`).

**FOI IDENTIFICADA UMA VULNERABILIDADE CRÍTICA DESTRUITIVA:** A rota de API `/api/reset-db` está configurada como pública e sem nenhuma autenticação, permitindo que qualquer pessoa na internet destrua e apague todo o banco de dados da empresa com uma simples requisição HTTP GET ou POST.

Adicionalmente, rotas de API públicas essenciais para o fluxo de checkout da vitrine anônima (`/api/checkout` e `/api/orders/[id]/status`) estão atualmente bloqueadas pelo middleware, impedindo clientes anônimos de finalizar compras caso não estejam logados como administradores.

---

## 2. O que foi encontrado (Evidências e Trechos de Código)

### A. [CRÍTICA] Rota `/api/reset-db` Exposta Publicamente sem Nenhuma Autenticação
- **Arquivos:**
  - [`src/lib/supabase/middleware.ts`](file:///c:/maiacode/cordeiroink/src/lib/supabase/middleware.ts#L45)
  - [`src/app/api/reset-db/route.ts`](file:///c:/maiacode/cordeiroink/src/app/api/reset-db/route.ts#L6-L22)
  - [`src/actions/inventory.ts`](file:///c:/maiacode/cordeiroink/src/actions/inventory.ts#L267-L280)
- **Status:** `CRITICAL`
- **Evidência 1: Whitelist pública no Middleware:**
  ```typescript
  // src/lib/supabase/middleware.ts (linha 45)
  const isPublicApi = pathname.startsWith("/api/upload") || pathname.startsWith("/api/reset-db");
  const isPublicRoute = isStorefront || isLoginPage || isPublicApi;
  ```
- **Evidência 2: Rota aceita GET e POST livremente:**
  ```typescript
  // src/app/api/reset-db/route.ts (linhas 6-22)
  export async function GET() {
    try {
      const result = await resetDatabaseToZero();
      return NextResponse.json(result);
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }
  ```
- **Evidência 3: Destruição total de dados:**
  ```typescript
  // src/actions/inventory.ts (linhas 267-280)
  export async function resetDatabaseToZero() {
    await prisma.auditLog.deleteMany();
    await prisma.financialTransaction.deleteMany();
    await prisma.purchaseOrderItem.deleteMany();
    await prisma.purchaseOrder.deleteMany();
    await prisma.productionJob.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.productBOM.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.rawItem.deleteMany();
    await prisma.supplier.deleteMany();
  ```
- **Impacto:** Catastrófico. Qualquer robô, crawler ou agente malicioso acessando `GET https://seu-dominio.com.br/api/reset-db` limpará instantaneamente todos os pedidos, transações financeiras, itens de estoque, produtos, fornecedores e logs de auditoria da Cordeiro Ink.

### B. [ALTA] Bloqueio Indevido de APIs de Checkout Público pelo Middleware
- **Arquivo:** [`src/lib/supabase/middleware.ts`](file:///c:/maiacode/cordeiroink/src/lib/supabase/middleware.ts#L42-L53)
- **Status:** `HIGH` (Quebra de funcionalidade de negócio)
- **Trecho:**
  ```typescript
  // Linhas 42-53:
  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/login";
  const isStorefront = pathname === "/";
  const isPublicApi = pathname.startsWith("/api/upload") || pathname.startsWith("/api/reset-db");
  const isPublicRoute = isStorefront || isLoginPage || isPublicApi;

  // Se o usuário não estiver logado e tentar acessar uma rota privada (/admin/*, /pedidos, /estoque, etc.)
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  ```
- **Problema:** As rotas `/api/checkout` e `/api/orders/[id]/status` NÃO constam em `isPublicApi`. Quando um cliente comum anônimo na vitrine tenta pagar via Mercado Pago (Payment Brick) ou o componente tenta fazer polling do Pix, o middleware redireciona a requisição com `HTTP 307 /login`, travando o checkout para quem não é administrador.

### C. [MÉDIA] Rota de Upload Aberta sem Autenticação nem Restrição de Extensão
- **Arquivo:** [`src/app/api/upload/route.ts`](file:///c:/maiacode/cordeiroink/src/app/api/upload/route.ts#L8-L45)
- **Status:** `MEDIUM`
- **Problema:** A rota aceita uploads de qualquer visitante anônimo. Não há validação de tamanho máximo do arquivo, extensão permitida ou verificação de tipo MIME. Qualquer usuário pode fazer upload contínuo de arquivos volumosos ou maliciosos (ex: SVGs com scripts embutidos para XSS).

---

## 3. O que já está seguro (Pontos Positivos)

1. **Webhook do Mercado Pago Estritamente Público:**
   - Em [`src/middleware.ts`](file:///c:/maiacode/cordeiroink/src/middleware.ts#L7-L10), as rotas `/api/webhooks` são liberadas de forma expressa no início do pipeline, sem passar por verificação de cookie de sessão, garantindo que os servidores do Mercado Pago nunca recebam redirecionamentos 302/307.
2. **Proteção Efetiva das Telas do ERP Administrativo:**
   - As páginas privadas (`/admin`, `/admin/vitrine`, `/pedidos`, `/producao`, `/estoque`, `/financeiro`, `/compras`, `/historico`, `/produtos`) são interceptadas com sucesso pelo middleware caso o usuário não possua sessão Supabase ativa, sendo redirecionadas para `/login`.
3. **Redirecionamento Inteligente de Usuário Já Autenticado:**
   - Caso um usuário autenticado acesse `/login`, o middleware o redireciona automaticamente para o dashboard operacional em `/admin`.

---

## 4. Recomendações de Correção

1. **Remover Imediatamente a Rota `/api/reset-db`:**
   - Apagar o arquivo `src/app/api/reset-db/route.ts` ou adicionar proteção estrita por token de segurança interno (`RESET_SECRET_TOKEN`) + verificação de ambiente não-produção (`process.env.NODE_ENV !== "production"`).
   - Remover `/api/reset-db` da lista `isPublicApi` em `src/lib/supabase/middleware.ts`.
2. **Atualizar as Rotas Públicas no Middleware:**
   - Em `src/lib/supabase/middleware.ts`, incluir `/api/checkout` e `/api/orders/` em `isPublicApi`:
     ```typescript
     const isPublicApi =
       pathname.startsWith("/api/checkout") ||
       pathname.startsWith("/api/orders") ||
       pathname.startsWith("/api/webhooks");
     ```
3. **Proteger a Rota `/api/upload`:**
   - Exigir sessão de operador ou adicionar validação rígida de tipo (`image/png`, `image/jpeg`, `image/webp`), tamanho máximo (ex: 15MB) e sanitização de nomes de arquivos.
