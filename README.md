# Cordeiro Ink Hub — Sistema Operacional & ERP Sob Demanda

O **Cordeiro Ink Hub** é o ERP e sistema operacional interno da marca de vestuário e estamparia sob demanda **Cordeiro Ink**. Desenvolvido com foco em estética dark moderna de alto padrão, alta produtividade na prensagem e controle financeiro de margens reais em vendas multicanal (Shopee, Shein, TikTok Shop e WhatsApp Direto).

---

## 🚀 Stack & Tecnologias
- **Framework:** Next.js (App Router, Turbopack, React 19, TypeScript).
- **Estilização:** Tailwind CSS (Dark theme padrão com paleta deep Zinc/Slate, bordas sutis e tipografia nítida).
- **Componentes & Ícones:** Radix UI patterns, Lucide React, Sonner (Toasts) e Recharts.
- **ORM & Banco:** Prisma ORM com SQLite local (`dev.db`), pronto para migração para PostgreSQL via variável `DATABASE_URL`.
- **Gerenciamento de Estado & Dados:** Server Actions nativas do Next.js com revalidação de rotas.

---

## 📦 Funcionalidades & Módulos Implementados

### 1. Dashboard Executivo & Operacional (`/`)
- **Métricas do Ciclo:** Faturamento Bruto, Lucro Líquido Real, Ticket Médio e Pedidos Ativos.
- **Filtros Temporais:** Hoje, Últimos 7 dias, Últimos 30 dias e Mês Atual.
- **Alertas de Estoque Crítico:** Identificação imediata de insumos (camisetas, DTFs, sacos zip) abaixo da margem de segurança.
- **Funil de Pedidos:** Acompanhamento do fluxo de vida de pedidos em tempo real.
- **Vendas por Canal:** Proporção de receita líquida entre Shopee, Shein, TikTok Shop e WhatsApp.
- **Produtos Mais Vendidos:** Ranking com fotos e faturamento por modelo de camiseta/estampa.

### 2. Gestão de Pedidos Multicanal (`/pedidos`)
- **Visualização Alternável:**
  - **Tabela Dinâmica:** Busca por número/cliente, filtros por canal e status, detalhamento de valores e margem líquida real.
  - **Quadro Kanban:** 5 colunas de status com avanço de etapa com 1 clique (Novo -> Pago -> Fila -> Em Produção -> Pronto -> Despachado).
- **Modal de Detalhes:** Desdobramento financeiro do pedido (valor produtos, frete, comissão do canal retida e lucro real da Cordeiro Ink).
- **Novo Pedido Manual:** Registro de vendas diretas (WhatsApp Pix) sem taxa de marketplace, com cálculo automático de CMV e envio imediato para a fila de produção.

### 3. Fila de Produção & Prensagem DTF (`/producao`)
- **Checklist Operacional Interativo:**
  1. Separar Camiseta Lisa do Estoque
  2. Separar e Recortar Estampa DTF
  3. Prensagem Térmica (160°C / 15s)
  4. Controle de Qualidade (Alinhamento & Aderência)
  5. Embalagem (Saco zip fosco + Tag kraft + Brinde holográfico)
- **Gatilho de Baixa Automática:** Ao clicar em *"Concluir Produção & Dar Baixa no Estoque"*, o sistema deduz automaticamente os insumos vinculados na Ficha Técnica (BOM) do estoque físico e atualiza o pedido para `READY`.

### 4. Estoque & Insumos (`/estoque`)
- **Aba 1 (Camisetas Lisas):** Grade por cor (Preto, Off-White, Marrom Cacau) e tamanho (P, M, G, GG, XG) com modelo da malha (26.1 Oversized / 30.1 Penteada).
- **Aba 2 (Banco de Estampas DTF):** Cards visuais com preview da arte, código de arte, tamanho de impressão (A3, A4, Bolso), fornecedor e custo unitário.
- **Aba 3 (Insumos & Embalagens):** Sacos zip foscos, tags kraft com sisal e brindes colecionáveis.
- **Ajuste Rápido de Saldo:** Modal com recálculo de diferença e registro de motivo no log de auditoria.

### 5. Catálogo de Produtos & Calculadora Interativa (`/produtos`)
- **Catálogo & Ficha Técnica (BOM):** Variantes com SKU composto (`INK-CYBER-BLK-M`) associadas aos insumos de montagem.
- **Calculadora de Precificação Interativa:**
  - Simulação de Custo da Camiseta + Estampa DTF + Embalagem.
  - Seleção do Canal (Shopee 20% + R$4, Shein 18%, TikTok 15%, Venda Direta 0%).
  - Definição da margem líquida alvo desejada (%) e simulação de volume de vendas mensal.
  - Exibe Preço de Venda Sugerido, Preço Mínimo (Break-even) e Lucro Líquido Real em R$ por peça.

### 6. Compras & Fornecedores (`/compras`)
- Registro de compras de reposição com fornecedores parceiros (Têxtil Menegotti, DTF Master Print SP, Pack & Box Embalagens).
- Ação rápida **"Marcar como Recebido e Atualizar Estoque"**: incrementa imediatamente o saldo dos insumos no inventário e lança a despesa correspondente.

### 7. Financeiro Básico & DRE Gerencial (`/financeiro`)
- **DRE Operacional:**
  - (+) Faturamento Bruto de Vendas
  - (-) Taxas e Comissões de Plataformas
  - (=) Receita Líquida
  - (-) CMV Insumos (Camisetas, DTFs e Embalagens)
  - (=) Lucro Bruto
  - (-) Despesas Fixas, Energia da Prensa e Marketing Ads
  - (=) **Lucro Líquido Real Cordeiro Ink**
- Extrato com histórico de transações e modal para lançar novas despesas/receitas.

### 8. Busca Global Inteligente (`Ctrl+K` / `⌘K`)
- Atalho acessível em qualquer tela com pesquisa em tempo real de pedidos, clientes, produtos, variantes e insumos/estampas.

---

## 🛠️ Como Executar Localmente

1. **Instalar as dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```

3. **Sincronizar banco de dados e popular com dados de teste:**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.
