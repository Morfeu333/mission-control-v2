# RELATÓRIO DE AUDITORIA — MISSION CONTROL V2
**Data:** 2026-03-30/31
**Gerado por:** Claude Code (análise estática + Convex API + browser headless)
**⚠️ Notion:** NÃO incluído neste relatório — dados virão numa próxima sessão com acesso à API

---

## CONTEXTO: MODELOS DE IA NOS AGENTS

Encontrado em `/home/automatrix/.openclaw/openclaw.json`:

| Agent | Modelo |
|-------|--------|
| Facebook Lead Scraper | `openai/gpt-5.4-mini` |
| Project Manager / CRM | `openai/gpt-5.4-mini` |
| SDR Agent | `anthropic/claude-sonnet-4-6` |
| Main Agent (default) | `anthropic/claude-sonnet-4-6` (fallback: opus-4-6, sonnet-4-5) |
| Memory Search (embeddings) | `gemini-embedding-001` |

---

## 1. DADOS ATIVOS NO CONVEX (Estado Real do Banco)

| Indicador | Valor |
|-----------|-------|
| **Total no pipeline** | 602 leads |
| **Em Conversa** | 366 |
| **Lead (entrada)** | 236 |
| **HOT leads** | 142 |
| **Escopo / Reunião / Em Impl. / Concluído / Perdido** | 0 cada |
| **Capturados hoje (30/03)** | 8 |
| **Pendente Notion sync** | 0 |
| **SDR pending** | 0 |

**Agentes registrados:**
- `project-manager` — idle, 0 erros
- `scraper` (Facebook Lead Scraper) — running, 0 erros

**Cron jobs configurados (5):**

| Nome | Schedule | Status | Último Run |
|------|----------|--------|------------|
| Facebook Lead Scraper | every 1h | ✅ enabled, ok | 33m ago |
| Memory Curator | `0 3 * * *` (3am) | ⚠️ enabled, **error** | 30/03 03:00 |
| Notion Lead Sync | `0 */2 * * *` (cada 2h) | ✅ enabled, ok | 36m ago |
| Project Manager - Pipeline & Drafts | `*/30 * * * *` (cada 30min) | ✅ enabled, ok | 19m ago |
| SDR Facebook Inbox Check | `30 * * * *` | ❌ **disabled** | nunca |

---

## 2. CAMPOS SALVOS NO CONVEX — O QUE APARECE NA TELA

Cada lead no Convex tem esses campos renderizados na UI:

| Campo Convex | Onde aparece na UI | Como aparece |
|---|---|---|
| `authorName` | Dashboard, Pipeline, Scraper, SDR Inbox | Nome do lead |
| `status` | Pipeline (coluna), Modal detail, SDR footer | StatusBadge + nome da coluna |
| `priority` | Pipeline cards, Scraper sidebar | PriorityBadge (hot/warm/cold) |
| `automationAngle` | Pipeline cards (2 linhas truncadas) + modal | Texto descritivo |
| `captureDate` | Pipeline cards | `dd/mm/aaaa` |
| `groupName` | SDR Inbox header, Scraper sidebar | Texto |
| `whatsapp` | Pipeline modal, SDR Inbox (badge WA) | Número ou badge verde |
| `telegram` | Pipeline modal | Texto |
| `email` | Pipeline modal | Texto |
| `preferredChannel` | Pipeline modal, SDR footer | Texto |
| `facebookMessagesCount` | Pipeline modal ("FB Mensagens"), SDR list | Número |
| `notionSynced` | Pipeline modal ("✓ Synced"/"⏳ Pending"), Scraper sidebar | Badge |
| `postText` | Pipeline modal ("Post Original") | Até 400 chars |
| `postLink` | Pipeline modal | Link "Ver post no Facebook →" |
| `profileLink` | SDR Inbox | Link "Facebook →" |
| `lastFbMessage` | SDR list | Preview truncado |
| `lastFbMessageAt` | SDR list | timestamp relativo |
| `lastFbReplyAt` | SDR footer | timestamp |
| `opportunityType` | Pipeline modal ("Tipo") | Texto |
| `notionId` | Não renderizado (só lógica interna) | — |

**Campos do Convex que existem mas NÃO estão visíveis em lugar nenhum:**
- `commentPosted`, `dmSent`, `draftEmail`, `draftWhatsapp`
- `engagement`, `hashtags`, `imessage`
- `fonte`, `dedupKey`, `screenshotPath`
- `postDate`, `otherChannelContactSent`, `lastFollowup`

---

## 3. ACESSO AO NOTION

- A Notion API key foi encontrada em `/home/automatrix/.openclaw/openclaw.json` no campo `skills.entries.notion.apiKey`
- **Este relatório não incluiu dados do Notion** — o banco de leads do Notion ainda precisa ser consultado
- Todos os 8 leads de hoje têm `notionSynced: true` e `notionId` preenchido
- O `project-manager` sincronizou 4 leads às 15:17 e 1 lead às 16:11 (dia 30/03)
- **Próximo passo:** buscar a Notion database com a API key para enriquecer o relatório

---

## 4. TODOS OS TEXTOS EM PORTUGUÊS — PARA REVISÃO/MODIFICAÇÃO

### Sidebar
```
MISSION
CONTROL
AUTOMATRIX IA
v2 · 2026
```

### Dashboard
```
MISSION CONTROL
Automatrix IA — Lead Pipeline Dashboard
total
hot
Hoje
leads capturados
HOT Leads
precisam atenção
Pendente Notion
aguardando sync
Total Pipeline
todos os estágios
Agents                    ← cabeçalho seção
Sem heartbeat...          ← empty state
OpenClaw
live ✓ / offline
Pipeline Overview         ← cabeçalho seção
Carregando...             ← loading state
🔥 Hot Leads (N)
Live Feed                 ← cabeçalho seção
Sem atividades ainda...   ← empty state
```

### Pipeline
```
Pipeline
Kanban de leads por estágio — atualiza a cada 15s
Convex offline: {error}
Carregando pipeline...
Lead / Em Conversa / Escopo / Reunião / Em Impl. / Concluído / Perdido
Grupo / Tipo / WhatsApp / Telegram / Email / Canal preferido / FB Mensagens / Notion  ← modal
✓ Synced / ⏳ Pending
Automation Angle          ← label (em inglês — candidato a tradução)
Post Original
Ver post no Facebook →
```

### Scraper
```
Scraper
Facebook lead scraper — histórico de runs e leads de hoje
Run Now                   ← botão (em inglês)
Hoje / leads capturados
Último Run / runs com sucesso
Erros (30 runs) / de {N} runs
Duração Média
Histórico de Runs
últimos {N}
Horário / Status / Novos / Atualizados / Duração / Resumo
Sem runs ainda...
Leads de Hoje
Nenhum lead capturado hoje.
✓ Notion
```

### SDR Inbox
```
SDR Inbox
{N} conversas aguardando resposta
Conversas ({N})
Nenhuma conversa pendente.
Selecione uma conversa
{N} msgs
📱 WA
mensagens recebidas
Sem mensagem
WhatsApp: {número}
Facebook →
Sem mensagens registradas no Convex para este lead.
(Mensagens são registradas pelo SDR agent durante as interações)
Status: {status}
Priority: {priority}          ← em inglês
Canal: {canal}
Último reply: {tempo}
```

### Agents
```
Agents
Status em tempo real dos agentes OpenClaw
Carregando agentes...
Nenhum agente registrou heartbeat ainda.
Os agentes registram status via POST /api/mc/agents/heartbeat
Last Heartbeat / Last Run / Errors / Task  ← em inglês (inconsistente!)
Recent Runs                                ← em inglês
Agent / Horário / Status / Novos / Atualizados / Duração / Resumo
Sem runs registrados...
Cron Status                ← em inglês
Nome / Status / Erros / Último Run / Duração / Próximo Run
never / ago                ← em inglês (função timeAgo)
```

### Cron Jobs
```
Cron Jobs
Gerenciamento de crons via OpenClaw
Refresh                    ← em inglês
✓ "{name}" triggered successfully    ← toast em inglês
Error: {e}                           ← toast em inglês
OpenClaw:
● live ✓ / ● Offline
{N} cron jobs
Carregando crons...
Nenhum cron job configurado.
Configure crons no openclaw.json
LAST RUN / NEXT RUN        ← em inglês
Run History                ← em inglês
Sem histórico disponível.
Running... / Run           ← botão (em inglês)
enabled / disabled         ← em inglês
✓ ok / ✗ {status}
{N} err / tokens           ← em inglês
```

### Memory
```
Memory
Browser de memórias e notas diárias dos agentes
Scraper Agent
Daily notes do agente de scraping Facebook
Project Manager
Notas do PM agent — Notion sync, leads processados
SDR Agent
Daily notes do SDR — conversas FB, contatos capturados
Main Agent
Memory do agente principal (Memory Curator)
Arquivos de hoje ({data}):
Para ler o conteúdo, acesse o arquivo diretamente no filesystem:
OpenClaw Sessions          ← em inglês
{N} sessions               ← em inglês
Nenhuma sessão ativa. / OpenClaw offline ou inacessível.
Session Details            ← em inglês (modal)
```

---

## 5. BUGS IDENTIFICADOS

### 🔴 Bug Crítico: "Duração Média" na página Scraper
Mostra **"215035m 22s"** — o `durationMs` de um run antigo tem valor absurdo (provavelmente microsegundos ou dado corrompido). A média calcula errado.

**Arquivo:** `src/pages/Scraper.tsx:58-61`
```ts
const avgDuration = okRuns.length > 0
  ? Math.round(okRuns.reduce((s, r) => s + r.durationMs, 0) / okRuns.length)
  : 0
```
**Fix:** Filtrar `durationMs` absurdos antes de calcular (ex: ignorar > 30min).

### 🔴 Bug: `oc.sessions()` não está definida
`Memory.tsx:47` chama `oc.sessions()`, mas essa função **não existe** em `openclaw-api.ts`.

**Arquivo:** `src/pages/Memory.tsx:47` + `src/lib/openclaw-api.ts`
**Fix:** Adicionar `sessions: () => ocFetch('/sessions')` em `openclaw-api.ts`.

### 🟡 Bug: StatCard recebe string como `value`
`Scraper.tsx:101` passa `"running"` como `value` para `StatCard` — funciona visualmente mas quebra tipagem.

**Arquivo:** `src/pages/Scraper.tsx:101`

### 🟡 Inconsistência: `timeAgo` em inglês
Retorna `"s ago"`, `"m ago"`, `"h ago"`, `"never"` — deveria ser português.

**Arquivos:** `src/pages/Dashboard.tsx:61-66`, `src/pages/Agents.tsx:8-15`

### 🟡 Memory Curator em erro sem destaque visual
O cron `Memory Curator` tem `lastStatus: error` mas não há indicador visual diferenciado no card.

---

## 6. SUGESTÕES DE FRONT-END / UX-UI

### Prioridade Alta

**1. Padronizar idioma: tudo em Português**
14+ labels em inglês espalhados pelo app (`Last Heartbeat`, `Last Run`, `Errors`, `Task`, `Recent Runs`, `Run History`, `LAST RUN`, `NEXT RUN`, `Run`, `Refresh`, `enabled`, `disabled`, `never`, `ago`, `tokens`, `Session Details`, `OpenClaw Sessions`). A mistura atual cria estranheza.

**2. Pipeline: busca e filtro por prioridade**
Com 602 leads (366 só em "Em Conversa"), a coluna fica muito longa. Adicionar:
- Campo de busca por nome no topo do kanban
- Botões toggle para filtrar por prioridade (hot/warm/cold)
- Badge de contagem refletindo o filtro ativo

**3. Pipeline: colunas vazias colapsáveis**
Escopo, Reunião, Em Impl., Concluído e Perdido estão sempre com 0. Com 7 colunas fixas o espaço horizontal é desperdiçado. Sugestão: ocultar colunas vazias por padrão, com opção de mostrar.

**4. Pipeline Modal: adicionar ações**
O modal mostra info mas não tem nenhuma ação. Sugestão:
- Botão "Mover para próxima etapa"
- Botão "Marcar como Perdido"
- Link direto para página no Notion (usando `notionId`)
- Exibir `draftWhatsapp` / `draftEmail` como sugestão de mensagem

**5. Dashboard: KPIs principais em destaque**
O widget "602 total / 142 hot" está elegante mas pequeno. Como são os números mais importantes, poderiam ser os primeiros dois StatCards com mais destaque visual.

### Prioridade Média

**6. Cron Jobs: destaque visual de erro**
Quando `lastStatus === 'error'`, o card deveria ter borda ou fundo vermelho suave para chamar atenção imediata.

**7. Agents: paginação ou filtro na tabela de runs**
A tabela de "Recent Runs" com 40 linhas ocupa quase a tela. Paginação (10 por página) ou filtro por agente resolveria.

**8. Memory: preview do conteúdo dos arquivos**
Atualmente instrui o usuário a usar `cat` no terminal — muito técnico. Adicionar endpoint no `local-api.mjs` para ler os `.md` e renderizá-los na UI com markdown.

**9. SDR Inbox: exibir drafts gerados pelos agentes**
Os campos `draftWhatsapp` e `draftEmail` existem no Convex mas não aparecem em nenhum lugar. O SDR Inbox é o lugar ideal para exibir e permitir editar/enviar esses drafts.

**10. Sidebar: hover states**
Só o item ativo tem destaque. Adicionar hover sutil (`rgba(255,255,255,0.06)`) melhora interatividade.

### Prioridade Baixa / Visual

**11. Dark mode opcional**
O tema bege claro é bonito, mas para uso de monitoring prolongado um dark mode seria útil. A sidebar escura já existe — seria estender para o conteúdo.

**12. Live Feed: ícones e labels humanizadas em PT**
Os tipos de atividade (`lead_created`, `notion_synced`, `dm_sent`) aparecem como texto nos logs. Adicionar ícones e labels traduzidas melhora scanabilidade.

**13. Loading states: skeleton loaders**
"Carregando pipeline...", "Carregando agentes..." poderiam ser substituídos por skeleton loaders animados no shape dos cards — experiência muito mais polida.

**14. Responsividade**
Grids de 4, 7 e 3 colunas não têm breakpoints responsivos. Em monitores abaixo de 1440px algumas colunas ficam estreitas demais.

**15. Título da aba do browser**
`index.html` tem `<title>mission-control-v2</title>` (default do Vite). Deveria ser `"Mission Control — Automatrix IA"`.

---

## 7. RESUMO EXECUTIVO — O QUE FAZER PRIMEIRO

| # | Item | Tipo | Complexidade |
|---|------|------|-------------|
| 1 | `oc.sessions()` não definida → erro silencioso | 🔴 Bug | Baixa (1 linha) |
| 2 | Duração Média mostrando "215035m 22s" | 🔴 Bug | Baixa |
| 3 | `<title>` da aba errado | 🟡 Texto | Trivial |
| 4 | 14+ labels em inglês numa app em português | 🟡 Texto | Baixa |
| 5 | `timeAgo` retornando inglês ("s ago", "never") | 🟡 Texto | Baixa |
| 6 | Memory Curator em erro sem destaque visual | 🟡 UX | Baixa |
| 7 | Pipeline sem busca/filtro com 600+ leads | ✨ Feature | Média |
| 8 | Colunas vazias do pipeline ocupando espaço | ✨ UX | Baixa |
| 9 | Pipeline modal sem ações (status, Notion link) | ✨ Feature | Média |
| 10 | SDR Inbox exibindo drafts dos agentes | ✨ Feature | Média |
| 11 | Buscar dados do Notion e cruzar com Convex | 📊 Dados | Média |

---

## 8. CAMPOS DO CONVEX NÃO EXIBIDOS — OPORTUNIDADES

Esses campos existem no banco mas a UI não mostra. Podem enriquecer muito a experiência:

| Campo | Onde faz sentido mostrar |
|-------|--------------------------|
| `draftWhatsapp` | SDR Inbox — como sugestão de resposta editável |
| `draftEmail` | SDR Inbox ou Pipeline modal |
| `commentPosted` | Pipeline modal — "Comentário postado: ..." |
| `dmSent` | Pipeline modal — confirmação visual |
| `lastFollowup` | Pipeline modal — data do último follow-up |
| `engagement` | Pipeline modal — métricas de engajamento |
| `fonte` | Pipeline modal — origem do lead (grupo, feed, etc.) |

---

*Relatório gerado sem acesso ao Notion. Próxima versão incluirá dados da Notion database.*
*Notion API key disponível em `/home/automatrix/.openclaw/openclaw.json` → `skills.entries.notion.apiKey`*
