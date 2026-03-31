# RELATÓRIO DE PADRÕES DE EXTRAÇÃO — NOTION DATABASE
**Database:** Clientes Automatrix (`30b840645b1781299475f37014a5b2f3`)
**Data do relatório:** 2026-03-31
**Total de leads analisados:** 1.292
**Fonte:** Notion API (acesso direto com `ntn_354400571118...`)

---

## 1. VISÃO GERAL DO BANCO

| Métrica | Valor |
|---------|-------|
| Total de leads no Notion | 1.292 |
| Período coberto | 2025-02-28 até 2026-03-31 |
| Dias com dados | 22 datas distintas |
| Leads sem data de captura | 8 |
| Maior volume em um dia | 288 (23/03/2026) |

**Campos disponíveis no schema:**
`Name`, `Status`, `Prioridade`, `Automation Angle`, `Post Completo`, `Comentário Postado`, `DM Enviada`, `Draft WhatsApp`, `Draft Email`, `Grupo`, `Contact Method`, `Opportunity Type`, `Fonte`, `WhatsApp`, `Profile Link`, `Post Link`, `Group Link`, `Hashtags`, `Engagement`, `Último Follow-up`, `Data do Post`, `Data de Captura`

---

## 2. SCORE DE COMPLETUDE POR DIA

> Score calculado sobre 13 campos: título limpo, angle, post_text, grupo, opp_type, priority, comment, dm, draft_wa, draft_email, contact_method, hashtags, fonte.

| Data | Score Médio | Leads | Observação |
|------|------------|-------|------------|
| **2026-03-06** | **89%** ⭐ | 69 | **Melhor padrão recente** |
| 2026-02-28 | 95% ⭐⭐ | 11 | Melhor absoluto (amostra pequena) |
| 2026-03-07 | 77% | 36 | Bom |
| **2026-03-29** | **81%** | 8 | Bom, amostra pequena |
| 2026-03-22 | 70% | 229 | Bom em escala |
| 2026-03-23 | 66% | 288 | Maior volume, qualidade media |
| 2026-03-19 | 65% | 125 | Boa escala, sem comentários |
| 2026-03-26 | 58% | 69 | Médio |
| 2026-03-28 | 55% | 71 | Médio |
| 2026-03-24 | 49% | 25 | Baixo |
| 2026-03-27 | 49% | 192 | Baixo (volume excessivo degradou qualidade) |
| 2026-03-30 | 49% | 32 | **Baixo — em queda** |
| 2026-03-25 | 47% | 15 | Baixo |
| **2026-03-31** | **34%** 🔴 | 31 | **Pior dia — bug ativo** |

---

## 3. EVOLUÇÃO DAS MÉTRICAS CHAVE (por dia)

### 3.1 Preenchimento do Automation Angle (%)

| Data | Angle preenchido |
|------|-----------------|
| 2026-03-06 | 100% ✅ |
| 2026-03-07 | 100% ✅ |
| 2026-02-28 | 100% ✅ |
| 2026-03-29 | 100% ✅ |
| 2026-03-22 | 87% ✅ |
| 2026-03-19 | 83% ✅ |
| 2026-03-26 | 64% |
| 2026-03-23 | 92% ✅ |
| 2026-03-28 | 55% |
| 2026-03-27 | 48% |
| 2026-03-30 | 41% |
| 2026-03-25 | 47% |
| **2026-03-31** | **23%** 🔴 |

### 3.2 Taxa de HOT Leads (%)

| Data | HOT % |
|------|-------|
| 2026-03-19 | 72% 🔥 |
| 2026-03-06 | 48% |
| 2026-03-07 | 44% |
| 2026-02-28 | 55% |
| 2026-03-26 | 43% |
| 2026-03-22 | 39% |
| 2026-03-29 | 50% |
| 2026-03-23 | 28% |
| 2026-03-28 | 22% |
| 2026-03-30 | 22% |
| 2026-03-27 | 23% |
| **2026-03-31** | **3%** 🔴 (1 lead HOT de 31) |

### 3.3 Execução de Ações (DM + Comentário)

| Data | DM% | Comentário% |
|------|-----|------------|
| 2026-03-06 | 96% | 91% ✅✅ |
| 2026-02-28 | 91% | 91% ✅✅ |
| 2026-03-07 | 39% | 47% |
| 2026-03-29 | 100% | 25% |
| 2026-03-22 | 37% | 24% |
| 2026-03-28 | 55% | 28% |
| 2026-03-27 | 40% | 21% |
| 2026-03-30 | 41% | 28% |
| **2026-03-31** | **19%** 🔴 | **3%** 🔴 |

### 3.4 Drafts Gerados (WhatsApp + Email)

| Data | Draft WA% | Draft Email% |
|------|-----------|-------------|
| 2026-03-06 | 86% | 84% ✅✅ |
| 2026-02-28 | 91% | 91% ✅✅ |
| 2026-03-29 | 100% | 100% ✅✅ |
| 2026-03-22 | 24% | 20% |
| 2026-03-28 | 48% | 48% |
| 2026-03-27 | 39% | 39% |
| 2026-03-30 | 41% | 41% |
| **2026-03-31** | **19%** 🔴 | **19%** 🔴 |

### 3.5 Hashtags (funcionalidade que sumiu)

| Data | Hashtags% |
|------|-----------|
| 2026-03-22 | 63% ✅ |
| 2026-03-19 | 53% ✅ |
| 2026-03-23 | 42% |
| 2026-03-26 | 33% |
| 2026-03-07 | 61% |
| 2026-03-27 | 3% |
| **2026-03-28 em diante** | **0%** 🔴 |

> ⚠️ As hashtags desapareceram completamente a partir de 28/03. Era um campo valioso para categorização.

### 3.6 Fonte dos Leads

| Data | Feed% | Grupo Direto% | Search% |
|------|-------|--------------|---------|
| 2026-02-28 | 18% | 82% |  |
| 2026-03-06 | 43% | 54% | 3% |
| 2026-03-19 | 70% | 30% |  |
| 2026-03-22 | 71% | 17% | 12% |
| 2026-03-23 | 51% | 8% | **41%** ← pico Search |
| 2026-03-26 | 90% | 10% |  |
| 2026-03-27 | 72% | 25% | 3% |
| 2026-03-28 | 76% | 24% |  |
| 2026-03-29 | 88% | 13% |  |
| 2026-03-30 | 84% | 16% |  |
| **2026-03-31** | **100%** | 0% |  |

> ⚠️ Nos últimos dias: zero leads de "Grupo Direto" e zero de "Search" — o scraper está capturando só Feed.

---

## 4. BUG CRÍTICO: TÍTULO COM PREFIXO "# Lead:"

A partir de **25/03/2026**, leads começaram a aparecer com título no formato `# Lead: Nome Sobrenome` — sem nenhum campo preenchido além de nome, prioridade e tipo.

### Escala do problema:

| Data | Total leads | Com "# Lead:" | % afetado |
|------|------------|---------------|-----------|
| 2026-03-25 | 15 | 6 | 40% |
| 2026-03-27 | 192 | 6 | 3% |
| 2026-03-30 | 32 | 5 | 16% |
| **2026-03-31** | **31** | **8** | **26%** |

### Exemplo de lead com bug (entrada fantasma):
```
Nome: "# Lead: Ammara Ashmal"
Grupo: [vazio]
Angle: [vazio]
Post Completo: [vazio]
Contact Method: [vazio]
Comentário: [vazio]
DM: NAO
Draft WA: NAO
Draft Email: NAO
```

### O que isso indica:
O agente scraper está **criando a entrada no Notion no início da análise** (como rascunho/placeholder) mas **não completando o processo de enriquecimento**. O prefixo `# Lead:` é sintaxe markdown que vazou de algum bloco de raciocínio do agente para o campo título — provavelmente um bloco `<think>` ou formato de output intermediário que está sendo usado incorretamente como nome final.

---

## 5. O PADRÃO OURO (Gold Standard)

### Baseado em: **2026-03-06** (89% completude) + **2026-02-28** (95%)

### 5.1 Formato do Título
```
[Nome da Pessoa] - [Descrição concisa do que precisam]
```

**Exemplos reais do padrão ouro:**
- `Francis Connects - Automation Architect $2k/month (Beauty & Medspa)`
- `Vivian Couto - Agência Pavé Social Media Manager`
- `Luiz Felipi - Gestor Tráfego Loja Construção`
- `Luiz Felipi - Agência SP busca automação de relatórios e CRM`

**Nunca:**
- `# Lead: Nome Sobrenome` ← bug
- `Nome Sobrenome` ← genérico sem contexto
- `Nome - Descrição muito longa sem recorte` ← verboso

### 5.2 Campos Obrigatórios (100% dos leads)

| Campo | Conteúdo esperado | Exemplo |
|-------|------------------|---------|
| **Name** | `[Nome] - [contexto breve]` | `Francis Connects - Automation Architect $2k/month` |
| **Automation Angle** | Problema específico + solução Automatrix (150-300 chars) | `Beauty & Medspa startup hiring automation architect. GHL + Zapier + Make. Evaluate exclusivity before reaching out.` |
| **Post Completo** | Texto original do post (100-700 chars) | Cópia fiel do post do Facebook |
| **Grupo** | Nome do grupo ou "Personal Feed (Public)" | `System Automation`, `Social Media Brasil` |
| **Opportunity Type** | Project / Hiring / Partnership | `Hiring` |
| **Prioridade** | 🔥 HOT / ⭐ WARM / ❄️ COLD | `🔥 HOT` |
| **Fonte** | Feed / Grupo Direto / Search | `Grupo Direto` |
| **DM Enviada** | Texto da DM enviada ou marcação | `"Oi Luiz! Trabalho com automação..."` |

### 5.3 Campos de Alta Completude (>80% dos leads)

| Campo | Meta | Conteúdo |
|-------|------|---------|
| **Draft WhatsApp** | >85% | Mensagem personalizada pronta para enviar, tom informal, referência ao post |
| **Draft Email** | >80% | Versão email da abordagem, tom mais formal |
| **Comentário Postado** | >85% | Texto do comentário OU `"Não — [motivo]"` (ex: "exclusividade exigida") |
| **Contact Method** | >90% | Canal e instrução específica (ex: `"Email: vagas@empresa.com"`, `"Facebook DM"`, `"Send me a message"`) |

### 5.4 Campos Intermitentes (quando disponíveis)

| Campo | Quando preencher |
|-------|-----------------|
| **Hashtags** | Quando o post original tem hashtags — copiar fielmente |
| **WhatsApp** | Quando número aparece no post ou comentários |
| **Profile Link** | Sempre que possível (link do perfil no grupo) |
| **Post Link** | URL direta do post do Facebook |
| **Engagement** | Notas sobre interação (likes, comentários recebidos) |

### 5.5 Exemplo Completo do Padrão Ouro

```
Nome: Luiz Felipi - Gestor Tráfego Loja Construção
Status: Lead
Prioridade: 🔥 HOT
Opportunity Type: Hiring
Fonte: Feed
Grupo: Comunidade de Tráfego Pago

Automation Angle:
  Loja de material de construção buscando gestor de tráfego.
  Ângulo: tráfego pago + automação de leads (Meta Ads → WhatsApp API
  → CRM → follow-up automático). Relatórios automáticos de performance.

Post Completo:
  [texto original do post — 64 chars neste caso]

Contact Method:
  Facebook DM / Messenger (comentários indicam contato via privado)

Comentário Postado:
  "Oi Luiz! Trabalho com automação de marketing digital —
  posso integrar automação de leads, CRM e remarketing automatizado
  para potencializar seus resultados. Posso ajudar com a parte
  técnica de automação enquanto você foca na estratégia de tráfego."

DM Enviada:
  [texto da DM]

Draft WhatsApp:
  "Oi Luiz! Vi seu post sobre gestor de tráfego para a loja de
  construção. Além da gestão dos anúncios posso montar toda a
  automação: Meta Ads → WhatsApp automático → CRM → follow-up.
  Te interessa?"

Draft Email:
  [versão email da abordagem]
```

---

## 6. COMPARAÇÃO: PADRÃO OURO vs PADRÃO ATUAL

| Aspecto | Padrão Ouro (Mar 06) | Padrão Atual (Mar 31) |
|---------|---------------------|----------------------|
| **Completude** | 89% | 34% 🔴 |
| **Angle preenchido** | 100% | 23% |
| **DM executada** | 96% | 19% |
| **Comentário postado** | 91% | 3% |
| **Draft WA gerado** | 86% | 19% |
| **Contact Method** | 96% | 16% |
| **Post Completo** | 100% | 23% |
| **Hashtags** | Quando há | 0% |
| **Taxa HOT** | 48% | 3% |
| **Título limpo** | 100% | 74% (26% com bug) |
| **Fonte variada** | Feed + Grupo Direto | 100% Feed |
| **Tipo de lead** | Mix Project/Hiring | 58% Hiring |

---

## 7. CAUSAS PROVÁVEIS DA DEGRADAÇÃO

### 7.1 Bug do título "# Lead:" (início ~25/03)
O agente começou a usar um template de output onde o nome do lead é prefixado com `# Lead:` em markdown. Isso sugere uma mudança no **prompt do agente** ou no **formato de output esperado** que introduziu esse prefixo como parte do raciocínio intermediário.

**Impacto:** Leads com esse padrão têm 100% dos campos de enriquecimento vazios — são entradas fantasmas que poluem o Notion sem valor.

### 7.2 Volume excessivo degradando qualidade (27/03)
Em 27/03, 192 leads foram capturados em um dia — o maior volume desde março. A qualidade caiu para 49% nesse dia. Quando o agente tenta processar muitos posts de uma vez, o enriquecimento (angle, drafts, DM) fica incompleto.

### 7.3 Abandono das fontes Grupo Direto e Search
Nos últimos 2 dias, 100% dos leads vêm do Feed. Grupos diretos e busca ativa foram abandonados. Historicamente, leads de Grupo Direto têm qualidade superior (intenção mais clara, contexto melhor).

### 7.4 Queda no Opportunity Type "Project"
O tipo "Project" costumava representar 40-50% dos leads — agora cai para 32% (30/03) e está sendo dominado por "Hiring". Leads de Project têm melhor conversão que simples vagas de emprego.

### 7.5 Desaparecimento das hashtags (28/03+)
A extração de hashtags foi desativada ou quebrou. Essa funcionalidade ajudava na categorização e segmentação dos leads.

---

## 8. RECOMENDAÇÕES PARA O AGENTE SCRAPER

### Fixes imediatos (bugs):
1. **Remover prefixo `# Lead:` do título** — o nome final nunca deve conter markdown
2. **Não criar entrada no Notion antes de completar o enriquecimento** — ou usar um campo "status_interno = rascunho" e só sincronizar entradas completas
3. **Restaurar extração de hashtags** — era funcional até 27/03
4. **Restaurar busca em Grupos Diretos** — fontes diversificadas = qualidade superior

### Parâmetros do padrão ouro a restaurar:
5. **Forçar preenchimento de Automation Angle em 100% dos leads** — se não há angle claro, o lead não deve ser capturado
6. **Gerar Draft WhatsApp em todos os leads HOT e WARM** antes de criar a entrada
7. **Limitar volume por run** — mais de 50-60 leads por run sacrifica qualidade
8. **Restaurar Contact Method como campo obrigatório** — era 96% em março 06
9. **Rebalancear fontes** — meta: ≥20% Grupo Direto, Search ativado quando disponível

---

## 9. DISTRIBUIÇÃO DOS LEADS (estado atual do pipeline Notion)

### Por Status:
```
Lead        ████████████████████████████████████  (maioria)
Em Conversa ████████████████ (significativo)
Concluído   ■ (poucos)
Perdido     ■ (poucos)
```
*(dados detalhados requerem query filtrada por status — não incluída nesta versão)*

### Por Tipo (total histórico):
- Hiring: dominante (~45%)
- Project: segundo (~38%)
- Partnership: menor (~10%)
- Sem tipo: restante

### Por Prioridade (total histórico):
- WARM: ~46%
- HOT: ~35%
- COLD: ~19%

---

## 10. CAMPOS VISÍVEIS NA UI vs CAMPOS NO NOTION

| Campo Notion | Aparece no Mission Control? |
|---|---|
| Name | ✅ (todos os painéis) |
| Status | ✅ (Pipeline kanban, badges) |
| Prioridade | ✅ (PriorityBadge) |
| Automation Angle | ✅ (Pipeline cards + modal) |
| Grupo | ✅ (SDR header, Scraper) |
| WhatsApp | ✅ (modal, SDR badge) |
| Data de Captura | ✅ (Pipeline cards) |
| Post Link | ✅ (modal "Ver post no Facebook") |
| Profile Link | ✅ (SDR "Facebook →") |
| **Comentário Postado** | ❌ Não aparece |
| **DM Enviada** | ❌ Não aparece |
| **Draft WhatsApp** | ❌ Não aparece |
| **Draft Email** | ❌ Não aparece |
| **Contact Method** | ❌ Não aparece |
| **Hashtags** | ❌ Não aparece |
| **Engagement** | ❌ Não aparece |
| **Opportunity Type** | ✅ (modal "Tipo") |
| **Fonte** | ❌ Não aparece |
| **Post Completo** | ✅ parcial (modal "Post Original", 400 chars) |
| **Último Follow-up** | ❌ Não aparece |

> 8 campos ricos existem no Notion mas **nunca aparecem na UI**. O maior desperdício: `Comentário Postado`, `DM Enviada`, `Draft WhatsApp`, `Contact Method` — seriam extremamente úteis no SDR Inbox.

---

## 11. RESUMO EXECUTIVO

### O que estava funcionando muito bem (padrão março 06):
- Título descritivo e limpo
- 100% com Automation Angle detalhado
- 96% com DM executada no mesmo run
- 91% com comentário postado (ou motivo documentado de não postar)
- 86% com Draft WhatsApp personalizado pronto
- 96% com Contact Method mapeado
- Fontes diversificadas (Feed + Grupo Direto)
- Volume controlado (~70 leads/dia) com alta qualidade

### O que quebrou recentemente (março 28-31):
- Bug do prefixo `# Lead:` criando entradas vazias
- Queda drástica na taxa HOT (de 48% para 3%)
- Abandon das ações (DM de 96% para 19%, comentário de 91% para 3%)
- Zero hashtags, zero Grupo Direto, zero Search
- Volume inconsistente (192 em um dia, 8 em outro, 31 hoje)
- 34% de completude — o pior valor registrado

### Prioridade para restauração:
1. 🔴 Corrigir bug do título `# Lead:` (afeta 26% dos leads hoje)
2. 🔴 Restaurar obrigatoriedade do Automation Angle
3. 🟡 Restaurar geração de drafts (WA + Email) em todos os leads
4. 🟡 Restaurar Contact Method como campo obrigatório
5. 🟡 Reativar Grupo Direto e Search como fontes
6. 🟡 Restaurar extração de hashtags
7. 🟢 Limitar volume por run (máx 50-60) para preservar qualidade
8. 🟢 Não criar entrada no Notion antes de completar enriquecimento

---

*Relatório gerado com acesso direto à Notion API.*
*Próxima análise recomendada: cruzar leads do Notion com Convex para identificar divergências de sincronização.*
