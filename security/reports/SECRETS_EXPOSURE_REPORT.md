# Relatório de Auditoria de Segurança: SECRETS_EXPOSURE

**Projeto:** Cordeiro Ink Hub (Next.js, Prisma, Supabase, Mercado Pago)  
**Data da Auditoria:** 23 de Outubro de 2026  
**Status Geral:** `MEDIUM`  

---

## 1. Resumo Executivo
Foi realizada uma auditoria completa na árvore do repositório, histórico do Git (`git log`), arquivos de variáveis de ambiente (`.env`, `.env.example`, `.env.local`), configurações de empacotamento do Next.js e referências a tokens de gateway e banco de dados.

Não foram encontrados tokens ou credenciais confidenciais expostas no histórico público do Git. No entanto, foram identificados pontos de atenção na sanitização de chaves de teste hardcoded no frontend e na separação de credenciais locais.

---

## 2. O que foi encontrado (Evidências e Trechos de Código)

### A. Fallback Hardcoded de Chave Pública do Mercado Pago no Frontend
- **Arquivo:** [`src/components/checkout/MercadoPagoPayment.tsx`](file:///c:/maiacode/cordeiroink/src/components/checkout/MercadoPagoPayment.tsx#L105-L107)
- **Status:** `MEDIUM`
- **Trecho:**
  ```typescript
  // Linhas 105-107:
  const publicKey =
    process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY ||
    "TEST-4c19dc2d-884a-45ba-9a29-292ced213525";
  ```
- **Risco:** Embora se trate de uma chave pública (Client-Side), a presença de uma chave de teste (`TEST-...`) embutida como fallback diretamente no bundle compilado do cliente pode fazer com que a loja processe pagamentos em ambiente de homologação/sandbox se a variável de ambiente `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` falhar ou não for injetada no build de produção.

### B. Chaves Reais no Arquivo `.env` Local (Não Comitadas)
- **Arquivo:** `.env` (Raiz do projeto)
- **Status:** `LOW` (Boas práticas de gestão de segredos)
- **Detecção:** O arquivo `.env` local contém:
  - `DATABASE_URL` com senha de produção do pooler Supabase.
  - `SUPABASE_SERVICE_ROLE_KEY` (chave com bypass total de RLS).
  - `MERCADO_PAGO_ACCESS_TOKEN` (`APP_USR-...`).
  - `MELHOR_ENVIO_TOKEN` (Bearer token de produção).
- **Risco:** O arquivo está devidamente ignorado no `.gitignore` e nunca foi enviado ao Git. No entanto, por ser uma máquina de desenvolvimento, o compartilhamento indevido dessa pasta ou backups não encriptados podem comprometer as credenciais.

---

## 3. O que já está seguro (Pontos Positivos)

1. **Configuração do `.gitignore`:**
   - O arquivo [`.gitignore`](file:///c:/maiacode/cordeiroink/.gitignore#L33-L36) bloqueia rigorosamente `.env*` e permite apenas `.env.example`:
     ```gitignore
     # env files (can opt-in for committing if needed)
     .env*
     !.env.example
     ```
2. **Histórico do Git Limpo:**
   - Varredura de histórico com `git log -S` e verificação de blobs confirmaram que nenhum arquivo `.env` ou token sensível (`APP_USR-`, chaves de API) foi comitado em commits anteriores.
3. **Arquivo `.env.example` Sanitizado:**
   - O arquivo [`.env.example`](file:///c:/maiacode/cordeiroink/.env.example) contém estritamente valores fictícios e instruções (`[SENHA_DO_BANCO]`, `sua-chave-anon-publica-aqui`).
4. **Proteção de Execução do `createAdminClient`:**
   - O arquivo [`src/lib/supabase/admin.ts`](file:///c:/maiacode/cordeiroink/src/lib/supabase/admin.ts#L11-L15) implementa barreira de execução no navegador:
     ```typescript
     if (typeof window !== "undefined") {
       throw new Error(
         "Violação de segurança: createAdminClient não pode ser executado no navegador!"
       );
     }
     ```
   - Isso impede que a `SUPABASE_SERVICE_ROLE_KEY` vaze acidentalmente para o frontend.
5. **Nenhum Segredo Crítico em Variáveis `NEXT_PUBLIC_*`:**
   - As únicas variáveis com prefixo `NEXT_PUBLIC_` são a URL do Supabase, Anon Key, Public Key do MP e telefone do WhatsApp, todas previstas para consumo no cliente.

---

## 4. Recomendações de Correção

1. **Remover Chave de Teste Hardcoded:**
   - Em [`src/components/checkout/MercadoPagoPayment.tsx`](file:///c:/maiacode/cordeiroink/src/components/checkout/MercadoPagoPayment.tsx#L105-L107), remover o fallback para `"TEST-4c19dc2d-884a-45ba-9a29-292ced213525"`. Se a variável não estiver definida, exibir um alerta de configuração para o operador em vez de inicializar silenciosamente em sandbox.
2. **Rotação de Credenciais:**
   - Recomendado rotacionar o `MELHOR_ENVIO_TOKEN` e `MERCADO_PAGO_ACCESS_TOKEN` periodicamente e manter os valores definitivos configurados nas variáveis de ambiente seguras da Vercel / plataforma de deploy.
