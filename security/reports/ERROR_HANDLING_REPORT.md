# Relatório de Auditoria de Segurança: ERROR_HANDLING

**Projeto:** Cordeiro Ink Hub (Next.js, Prisma, Supabase, Mercado Pago)  
**Data da Auditoria:** 23 de Outubro de 2026  
**Status Geral:** `LOW`  

---

## 1. Resumo Executivo
Esta auditoria inspecionou os tratamentos de erro em toda a aplicação: Route Handlers (`src/app/api/*`), Server Actions (`src/actions/*`) e componentes React do cliente.

O objetivo principal foi verificar se stack traces internos, detalhes da infraestrutura de banco de dados (erros nativos do Prisma ou do driver PostgreSQL) ou objetos não serializados estão sendo vazados para o navegador ou provocando falhas de renderização no React (como o recente `Minified React error #441`).

A aplicação encontra-se em bom estado após as correções recentes de serialização nos componentes de pedido, sem nenhum vazamento de stack traces (`error.stack`) para o cliente. Foram identificados apenas pontos menores de vazamento de mensagens internas em APIs específicas.

---

## 2. O que foi encontrado (Evidências e Trechos de Código)

### A. Exposição de Erros Internos da API Mercado Pago via Campo `cause`
- **Arquivo:** [`src/app/api/checkout/route.ts`](file:///c:/maiacode/cordeiroink/src/app/api/checkout/route.ts#L238-L245)
- **Status:** `LOW`
- **Trecho:**
  ```typescript
  // Linhas 238-245:
  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
      cause: error.cause || null,
    },
    { status: statusCode }
  );
  ```
- **Risco:** O array `error.cause` emitido pelo SDK do Mercado Pago pode conter detalhes técnicos internos da requisição (códigos de validação de parâmetros, schemas internos). Não chega a expor senhas ou tokens, mas pode vazar informações de arquitetura da integração.
- **Recomendação:** Em ambiente de produção, retornar apenas uma mensagem amigável para o cliente (`error: "Não foi possível processar o pagamento com os dados informados"`) e registrar o `error.cause` apenas nos logs do servidor com `console.error`.

### B. Concatenação Direta de Exceções em Respostas de Upload e Frete
- **Arquivos:**
  - [`src/app/api/upload/route.ts`](file:///c:/maiacode/cordeiroink/src/app/api/upload/route.ts#L97):
    ```typescript
    return NextResponse.json(
      { error: "Erro ao processar upload: " + (err.message || "Erro interno") },
      { status: 500 }
    );
    ```
  - [`src/actions/shipping.ts`](file:///c:/maiacode/cordeiroink/src/actions/shipping.ts#L216):
    ```typescript
    return {
      success: false,
      options: [],
      error: `Falha na comunicação com o Melhor Envio: ${err.message}`,
    };
    ```
- **Risco:** Se `err.message` contiver mensagens de erro de rede, caminhos de arquivo locais (ex: `ENOENT: /var/task/...`) ou respostas de falha de conexão do PostgreSQL, esse detalhe de infraestrutura é repassado ao frontend.
- **Recomendação:** Sanitizar mensagens para o usuário final e isolar detalhes técnicos nos logs de servidor.

---

## 3. O que já está seguro (Pontos Positivos)

1. **Eliminação do React Error #441:**
   - Nos modais e componentes de pedido ([`OrderDetailModal.tsx`](file:///c:/maiacode/cordeiroink/src/components/orders/OrderDetailModal.tsx), [`OrderSheet.tsx`](file:///c:/maiacode/cordeiroink/src/components/orders/OrderSheet.tsx), [`OrdersKanban.tsx`](file:///c:/maiacode/cordeiroink/src/components/orders/OrdersKanban.tsx), [`CancelOrderModal.tsx`](file:///c:/maiacode/cordeiroink/src/components/orders/CancelOrderModal.tsx), [`EditOrderModal.tsx`](file:///c:/maiacode/cordeiroink/src/components/orders/EditOrderModal.tsx)), nenhum erro cru ou objeto não serializado é repassado para o `toast.error` ou nós do JSX:
     ```typescript
     const message = error?.message || (typeof error === "string" ? error : "Erro interno");
     toast.error(`Erro ao alterar pagamento: ${String(message)}`);
     ```
2. **Nenhum `error.stack` Exposto:**
   - Foi realizada busca em todo o diretório `src/` e nenhuma rota ou Server Action expõe stack traces (`stack`) para os clientes.
3. **Tratamento de Exceções nas Server Actions:**
   - Em [`src/actions/orders.ts`](file:///c:/maiacode/cordeiroink/src/actions/orders.ts), funções como `toggleOrderPaymentStatus` e `updateOrderStatus` capturam exceções e retornam objetos serializáveis `{ success: false, error: ... }`, impedindo unhandled rejections que derrubem renderizações no Next.js App Router.
4. **Mensagens Amigáveis na API de Status de Pedido:**
   - Em [`src/app/api/orders/[id]/status/route.ts`](file:///c:/maiacode/cordeiroink/src/app/api/orders/%5Bid%5D/status/route.ts#L79-L85), falhas de consulta retornam estritamente:
     ```typescript
     { success: false, error: "Erro interno ao consultar status do pedido." }
     ```
     Sem revelar nenhuma informação sobre o PostgreSQL ou Prisma.

---

## 4. Recomendações de Correção

1. **Remover o campo `cause` da resposta JSON pública em `/api/checkout`:**
   - Manter `error.cause` restrito a `console.error` no servidor.
2. **Padronização de Mensagens de Erro em Server Actions:**
   - Criar uma função utilitária centralizada (ex: `formatActionError(err)`) para retornar mensagens limpas e orientadas ao usuário, prevenindo vazamento de paths do sistema de arquivos ou strings de erro de bibliotecas externas.
