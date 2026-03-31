import { useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import { convexApi } from '../lib/convex-api'
import { usePolling } from '../lib/usePolling'
import PriorityBadge from '../components/PriorityBadge'
import StatusBadge from '../components/StatusBadge'
import PageHeader from '../components/PageHeader'

const STAGES = [
  { key: 'lead', label: 'Lead' },
  { key: 'em_conversa', label: 'Em Conversa' },
  { key: 'escopo_definido', label: 'Escopo' },
  { key: 'reuniao_agendada', label: 'Reunião' },
  { key: 'em_implementacao', label: 'Em Impl.' },
  { key: 'concluido', label: 'Concluído' },
  { key: 'perdido', label: 'Perdido' },
]

const STAGE_COLORS: Record<string, string> = {
  lead: '#6B7280',
  em_conversa: '#3B82F6',
  escopo_definido: '#8B5CF6',
  reuniao_agendada: '#F59E0B',
  em_implementacao: '#10B981',
  concluido: '#059669',
  perdido: '#9CA3AF',
}

const STATUS_NEXT: Record<string, string> = {
  lead: 'em_conversa',
  em_conversa: 'escopo_definido',
  escopo_definido: 'reuniao_agendada',
  reuniao_agendada: 'em_implementacao',
  em_implementacao: 'concluido',
}

const STATUS_LABELS: Record<string, string> = {
  lead: 'Lead',
  em_conversa: 'Em Conversa',
  escopo_definido: 'Escopo Definido',
  reuniao_agendada: 'Reunião Agendada',
  em_implementacao: 'Em Implementação',
  concluido: 'Concluído',
  perdido: 'Perdido',
}

const PRIORITY_OPTIONS = [
  { key: 'hot', label: '🔥 Hot' },
  { key: 'morno', label: 'Morno' },
  { key: 'frio', label: 'Frio' },
]

const API_BASE = 'https://compassionate-shrimp-199.convex.site/api/mc/leads'
const API_KEY = 'automatrix-mission-control'

async function updateLeadStatus(leadId: string, status: string): Promise<void> {
  const res = await fetch(`${API_BASE}/updateStatus`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Automatrix-Key': API_KEY,
    },
    body: JSON.stringify({ leadId, status }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text}`)
  }
}

export default function Pipeline() {
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<Set<string>>(new Set())
  const [collapsedCols, setCollapsedCols] = useState<Set<string>>(new Set())
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [expandedDrafts, setExpandedDrafts] = useState<Set<string>>(new Set())
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const fetcher = useCallback(async () => {
    const results: any[] = []
    const promises = STAGES.map(async (stage) => {
      try {
        const data = await convexApi.leads.byStatus(stage.key)
        const arr = Array.isArray(data) ? data : data.leads || []
        results.push(...arr)
      } catch { /* ignore per-stage errors */ }
    })
    await Promise.all(promises)
    return results
  }, [])

  const { data: leads, loading, error, refresh } = usePolling<any[]>(fetcher, 15000, [])

  // --- Filtering ---
  const filteredLeads = (leads || []).filter((lead: any) => {
    const matchesSearch = !search || (lead.authorName || '').toLowerCase().includes(search.toLowerCase())
    const matchesPriority = priorityFilter.size === 0 || priorityFilter.has(lead.priority)
    return matchesSearch && matchesPriority
  })

  const leadsByStatus: Record<string, any[]> = {}
  STAGES.forEach((s) => { leadsByStatus[s.key] = [] })
  filteredLeads.forEach((l: any) => {
    if (l.status && leadsByStatus[l.status]) {
      leadsByStatus[l.status].push(l)
    }
  })

  const totalVisible = filteredLeads.length

  // --- Handlers ---
  function togglePriority(key: string) {
    setPriorityFilter((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function toggleDraft(field: string) {
    setExpandedDrafts((prev) => {
      const next = new Set(prev)
      if (next.has(field)) next.delete(field)
      else next.add(field)
      return next
    })
  }

  async function copyToClipboard(text: string, field: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch { /* ignore */ }
  }

  async function handleMoveStatus(newStatus: string) {
    if (!selectedLead || updatingStatus) return
    setUpdatingStatus(true)
    setStatusMsg(null)
    try {
      await updateLeadStatus(selectedLead._id, newStatus)
      setStatusMsg({ type: 'success', text: `Movido para "${STATUS_LABELS[newStatus] || newStatus}"` })
      setSelectedLead((prev: any) => prev ? { ...prev, status: newStatus } : null)
      if (typeof refresh === 'function') refresh()
      setTimeout(() => setStatusMsg(null), 3500)
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Erro ao atualizar status' })
      setTimeout(() => setStatusMsg(null), 5000)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const nextStatus = selectedLead ? STATUS_NEXT[selectedLead.status] : null

  return (
    <div>
      <PageHeader
        title="Pipeline"
        subtitle="Kanban de leads por estágio — atualiza a cada 15s"
      />

      {error && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA',
          borderRadius: 8, padding: '12px 16px', marginBottom: 16,
          color: '#DC2626', fontSize: 13, fontFamily: 'system-ui'
        }}>
          Convex offline: {error}
        </div>
      )}

      {loading && !leads?.length && (
        <div style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'system-ui' }}>
          Carregando pipeline...
        </div>
      )}

      {/* Controls bar */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '12px 16px', marginBottom: 14,
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160, maxWidth: 320 }}>
          <span style={{
            position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none'
          }}>
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Buscar lead..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '6px 10px 6px 30px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: 6, fontSize: 13, fontFamily: 'system-ui',
              color: 'var(--text-primary)', outline: 'none',
            }}
          />
        </div>

        {/* Priority toggles */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {PRIORITY_OPTIONS.map((opt) => {
            const active = priorityFilter.has(opt.key)
            return (
              <button
                key={opt.key}
                onClick={() => togglePriority(opt.key)}
                style={{
                  padding: '5px 11px', borderRadius: 6, cursor: 'pointer',
                  fontSize: 12, fontFamily: 'system-ui', fontWeight: active ? 700 : 500,
                  border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: active ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.15s',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Count badge */}
        <span style={{
          marginLeft: 'auto', background: 'var(--bg-secondary)',
          border: '1px solid var(--border)', borderRadius: 10,
          padding: '3px 10px', fontSize: 12, fontFamily: 'monospace',
          fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap'
        }}>
          {totalVisible} lead{totalVisible !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Kanban board */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 12, alignItems: 'flex-start' }}>
        {STAGES.map((stage) => {
          const stageLeads = leadsByStatus[stage.key] || []
          const isEmpty = stageLeads.length === 0
          // For empty columns, default to collapsed unless explicitly expanded
          const showCollapsed = isEmpty && !collapsedCols.has('expanded:' + stage.key)

          if (showCollapsed) {
            return (
              <div
                key={stage.key}
                title={`${stage.label} (0 leads) — clique para expandir`}
                onClick={() => {
                  setCollapsedCols((prev) => {
                    const next = new Set(prev)
                    next.add('expanded:' + stage.key)
                    return next
                  })
                }}
                style={{
                  flex: '0 0 36px', width: 36, minWidth: 36,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderTop: `3px solid ${STAGE_COLORS[stage.key]}`,
                  borderRadius: 8, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '12px 0', gap: 8, minHeight: 120,
                  transition: 'opacity 0.15s',
                  opacity: 0.7,
                }}
              >
                <span style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  fontSize: 10, fontFamily: 'system-ui', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: 0.8,
                  color: 'var(--text-muted)', userSelect: 'none',
                }}>
                  {stage.label}
                </span>
                <span style={{
                  fontSize: 14, color: 'var(--text-muted)', lineHeight: 1,
                  fontFamily: 'system-ui',
                }}>+</span>
              </div>
            )
          }

          return (
            <div key={stage.key} style={{
              minWidth: 210, flex: '0 0 210px',
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8
            }}>
              {/* Column header */}
              <div style={{
                padding: '10px 14px', borderBottom: '1px solid var(--border)',
                borderTop: `3px solid ${STAGE_COLORS[stage.key]}`,
                borderRadius: '8px 8px 0 0',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{
                  fontFamily: 'system-ui', fontSize: 11, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--text-secondary)'
                }}>
                  {stage.label}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    background: 'var(--bg-secondary)', borderRadius: 10,
                    padding: '1px 7px', fontSize: 11, fontFamily: 'monospace',
                    fontWeight: 'bold', color: 'var(--text-primary)'
                  }}>
                    {stageLeads.length}
                  </span>
                  {/* Collapse button for expanded empty column */}
                  {isEmpty && (
                    <button
                      onClick={() => {
                        setCollapsedCols((prev) => {
                          const next = new Set(prev)
                          next.delete('expanded:' + stage.key)
                          return next
                        })
                      }}
                      title="Recolher coluna vazia"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '0 2px', fontSize: 14, color: 'var(--text-muted)',
                        lineHeight: 1,
                      }}
                    >
                      −
                    </button>
                  )}
                </div>
              </div>

              {/* Cards */}
              <div style={{
                padding: 8, display: 'flex', flexDirection: 'column', gap: 6,
                minHeight: 60, maxHeight: '65vh', overflowY: 'auto'
              }}>
                {stageLeads.length === 0 && (
                  <div style={{
                    textAlign: 'center', padding: '16px 8px',
                    color: 'var(--text-muted)', fontSize: 12, fontFamily: 'system-ui'
                  }}>—</div>
                )}
                {stageLeads.map((lead: any) => (
                  <div
                    key={lead._id}
                    onClick={() => {
                      setSelectedLead(lead)
                      setStatusMsg(null)
                      setExpandedDrafts(new Set())
                    }}
                    style={{
                      background: 'var(--bg-primary)', border: '1px solid var(--border)',
                      borderRadius: 6, padding: '10px 12px', cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      fontFamily: 'system-ui', fontSize: 12,
                      fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)'
                    }}>
                      {lead.authorName}
                    </div>
                    <PriorityBadge priority={lead.priority} />
                    {lead.automationAngle && (
                      <div style={{
                        fontSize: 11, color: 'var(--text-muted)',
                        marginTop: 5, fontFamily: 'system-ui', lineHeight: 1.3,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical' as any,
                      }}>
                        {lead.automationAngle}
                      </div>
                    )}
                    <div style={{
                      fontSize: 10, color: 'var(--text-muted)',
                      fontFamily: 'monospace', marginTop: 5
                    }}>
                      {new Date(lead.captureDate).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={() => setSelectedLead(null)}
        >
          <div
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 28, maxWidth: 600, width: '90%',
              maxHeight: '88vh', overflowY: 'auto', position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, margin: 0 }}>
                {selectedLead.authorName}
              </h2>
              <button
                onClick={() => setSelectedLead(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 22, color: 'var(--text-muted)', lineHeight: 1
                }}
              >×</button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              <PriorityBadge priority={selectedLead.priority} />
              <StatusBadge status={selectedLead.status} />
              {/* Notion link */}
              {selectedLead.notionId && (
                <a
                  href={`https://www.notion.so/${selectedLead.notionId.replace(/-/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    color: 'var(--accent)', fontSize: 12, fontFamily: 'system-ui',
                    textDecoration: 'none', padding: '2px 0',
                  }}
                >
                  Abrir no Notion →
                </a>
              )}
            </div>

            {/* Status action buttons */}
            <div style={{
              padding: '12px 14px', background: 'var(--bg-secondary)',
              borderRadius: 8, marginBottom: 16,
            }}>
              <div style={{
                fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
                letterSpacing: 0.8, fontFamily: 'system-ui', marginBottom: 8
              }}>Ações de Status</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {nextStatus && (
                  <button
                    onClick={() => handleMoveStatus(nextStatus)}
                    disabled={updatingStatus}
                    style={{
                      padding: '7px 14px', borderRadius: 6, cursor: updatingStatus ? 'not-allowed' : 'pointer',
                      fontSize: 12, fontFamily: 'system-ui', fontWeight: 600,
                      border: '1px solid var(--accent)', background: 'var(--accent)',
                      color: '#fff', opacity: updatingStatus ? 0.6 : 1,
                    }}
                  >
                    {updatingStatus ? 'Atualizando...' : `Mover para: ${STATUS_LABELS[nextStatus]}`}
                  </button>
                )}
                {selectedLead.status !== 'perdido' && (
                  <button
                    onClick={() => handleMoveStatus('perdido')}
                    disabled={updatingStatus}
                    style={{
                      padding: '7px 14px', borderRadius: 6, cursor: updatingStatus ? 'not-allowed' : 'pointer',
                      fontSize: 12, fontFamily: 'system-ui', fontWeight: 600,
                      border: '1px solid #DC2626', background: 'transparent',
                      color: '#DC2626', opacity: updatingStatus ? 0.6 : 1,
                    }}
                  >
                    Marcar como Perdido
                  </button>
                )}
                {!nextStatus && selectedLead.status === 'concluido' && (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'system-ui' }}>
                    Lead concluído — nenhuma ação disponível.
                  </span>
                )}
              </div>

              {/* Status feedback message */}
              {statusMsg && (
                <div style={{
                  marginTop: 10, padding: '7px 12px', borderRadius: 6,
                  fontSize: 12, fontFamily: 'system-ui',
                  background: statusMsg.type === 'success' ? '#DCFCE7' : '#FEF2F2',
                  color: statusMsg.type === 'success' ? '#15803D' : '#DC2626',
                  border: `1px solid ${statusMsg.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
                }}>
                  {statusMsg.type === 'success' ? '✓ ' : '✗ '}{statusMsg.text}
                </div>
              )}
            </div>

            {/* Main fields grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              {[
                ['Grupo', selectedLead.groupName],
                ['Tipo', selectedLead.opportunityType],
                ['WhatsApp', selectedLead.whatsapp || '—'],
                ['Telegram', selectedLead.telegram || '—'],
                ['Email', selectedLead.email || '—'],
                ['Canal preferido', selectedLead.preferredChannel || '—'],
                ['FB Mensagens', selectedLead.facebookMessagesCount],
                ['Notion', selectedLead.notionSynced ? '✓ Synced' : '⏳ Pending'],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <div style={{
                    fontSize: 10, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: 0.8,
                    fontFamily: 'system-ui', marginBottom: 2
                  }}>{label}</div>
                  <div style={{ fontSize: 13, fontFamily: 'system-ui' }}>{String(value ?? '—')}</div>
                </div>
              ))}
            </div>

            {/* Extra Notion fields */}
            {(selectedLead.fonte || selectedLead.engagement || selectedLead.lastFollowup ||
              selectedLead.dmSent !== undefined || selectedLead.commentPosted !== undefined) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                {selectedLead.fonte !== undefined && (
                  <div>
                    <div style={{
                      fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
                      letterSpacing: 0.8, fontFamily: 'system-ui', marginBottom: 2
                    }}>Fonte</div>
                    <div style={{ fontSize: 13, fontFamily: 'system-ui' }}>{String(selectedLead.fonte)}</div>
                  </div>
                )}
                {selectedLead.engagement !== undefined && (
                  <div>
                    <div style={{
                      fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
                      letterSpacing: 0.8, fontFamily: 'system-ui', marginBottom: 2
                    }}>Engajamento</div>
                    <div style={{ fontSize: 13, fontFamily: 'system-ui' }}>{String(selectedLead.engagement)}</div>
                  </div>
                )}
                {selectedLead.lastFollowup !== undefined && (
                  <div>
                    <div style={{
                      fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
                      letterSpacing: 0.8, fontFamily: 'system-ui', marginBottom: 2
                    }}>Último Follow-up</div>
                    <div style={{ fontSize: 13, fontFamily: 'system-ui' }}>
                      {selectedLead.lastFollowup
                        ? new Date(selectedLead.lastFollowup).toLocaleDateString('pt-BR')
                        : '—'}
                    </div>
                  </div>
                )}
                {selectedLead.dmSent !== undefined && (
                  <div>
                    <div style={{
                      fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
                      letterSpacing: 0.8, fontFamily: 'system-ui', marginBottom: 2
                    }}>DM Enviada</div>
                    <span style={{
                      display: 'inline-block', padding: '1px 7px', borderRadius: 4, fontSize: 12,
                      fontFamily: 'system-ui', fontWeight: 600,
                      background: selectedLead.dmSent ? '#DCFCE7' : '#FEF2F2',
                      color: selectedLead.dmSent ? '#15803D' : '#DC2626',
                    }}>
                      {selectedLead.dmSent ? '✓ Sim' : '✗ Não'}
                    </span>
                  </div>
                )}
                {selectedLead.commentPosted !== undefined && (
                  <div>
                    <div style={{
                      fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
                      letterSpacing: 0.8, fontFamily: 'system-ui', marginBottom: 2
                    }}>Comentário Postado</div>
                    <span style={{
                      display: 'inline-block', padding: '1px 7px', borderRadius: 4, fontSize: 12,
                      fontFamily: 'system-ui', fontWeight: 600,
                      background: selectedLead.commentPosted ? '#DCFCE7' : 'var(--bg-secondary)',
                      color: selectedLead.commentPosted ? '#15803D' : 'var(--text-muted)',
                    }}>
                      {selectedLead.commentPosted ? '✓ Postado' : '—'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {selectedLead.automationAngle && (
              <div style={{
                padding: '12px 14px', background: 'var(--bg-secondary)',
                borderRadius: 6, marginBottom: 12
              }}>
                <div style={{
                  fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
                  letterSpacing: 0.8, fontFamily: 'system-ui', marginBottom: 6
                }}>Automation Angle</div>
                <div style={{ fontSize: 13, lineHeight: 1.5, fontFamily: 'system-ui' }}>
                  {selectedLead.automationAngle}
                </div>
              </div>
            )}

            {selectedLead.postText && (
              <div style={{
                padding: '12px 14px', background: 'var(--bg-secondary)',
                borderRadius: 6, marginBottom: 12
              }}>
                <div style={{
                  fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase',
                  letterSpacing: 0.8, fontFamily: 'system-ui', marginBottom: 6
                }}>Post Original</div>
                <div style={{ fontSize: 12, lineHeight: 1.6, fontFamily: 'Georgia,serif' }}>
                  {selectedLead.postText.slice(0, 400)}
                  {selectedLead.postText.length > 400 ? '...' : ''}
                </div>
              </div>
            )}

            {/* Draft WhatsApp */}
            {selectedLead.draftWhatsapp && (
              <div style={{ marginBottom: 12 }}>
                <button
                  onClick={() => toggleDraft('whatsapp')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    display: 'flex', alignItems: 'center', gap: 6,
                    color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'system-ui',
                    fontWeight: 600, marginBottom: expandedDrafts.has('whatsapp') ? 8 : 0,
                  }}
                >
                  <span style={{ fontSize: 10 }}>{expandedDrafts.has('whatsapp') ? '▼' : '▶'}</span>
                  Draft WhatsApp
                </button>
                {expandedDrafts.has('whatsapp') && (
                  <div style={{ position: 'relative' }}>
                    <pre style={{
                      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                      borderRadius: 6, padding: '10px 40px 10px 12px',
                      fontSize: 12, fontFamily: 'monospace', lineHeight: 1.5,
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
                      color: 'var(--text-primary)',
                    }}>
                      {selectedLead.draftWhatsapp}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(selectedLead.draftWhatsapp, 'whatsapp')}
                      style={{
                        position: 'absolute', top: 8, right: 8,
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 4, cursor: 'pointer', padding: '2px 7px',
                        fontSize: 11, fontFamily: 'system-ui', color: 'var(--text-secondary)',
                      }}
                    >
                      {copiedField === 'whatsapp' ? '✓ Copiado' : 'Copiar'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Draft Email */}
            {selectedLead.draftEmail && (
              <div style={{ marginBottom: 12 }}>
                <button
                  onClick={() => toggleDraft('email')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    display: 'flex', alignItems: 'center', gap: 6,
                    color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'system-ui',
                    fontWeight: 600, marginBottom: expandedDrafts.has('email') ? 8 : 0,
                  }}
                >
                  <span style={{ fontSize: 10 }}>{expandedDrafts.has('email') ? '▼' : '▶'}</span>
                  Draft Email
                </button>
                {expandedDrafts.has('email') && (
                  <div style={{ position: 'relative' }}>
                    <pre style={{
                      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                      borderRadius: 6, padding: '10px 40px 10px 12px',
                      fontSize: 12, fontFamily: 'monospace', lineHeight: 1.5,
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0,
                      color: 'var(--text-primary)',
                    }}>
                      {selectedLead.draftEmail}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(selectedLead.draftEmail, 'email')}
                      style={{
                        position: 'absolute', top: 8, right: 8,
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 4, cursor: 'pointer', padding: '2px 7px',
                        fontSize: 11, fontFamily: 'system-ui', color: 'var(--text-secondary)',
                      }}
                    >
                      {copiedField === 'email' ? '✓ Copiado' : 'Copiar'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {selectedLead.postLink && (
              <a
                href={selectedLead.postLink} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-block', color: 'var(--accent)',
                  fontSize: 12, fontFamily: 'system-ui', textDecoration: 'none'
                }}
              >
                Ver post no Facebook →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
