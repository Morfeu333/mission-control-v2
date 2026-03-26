import { useState, useCallback } from 'react'
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

export default function Pipeline() {
  const [selectedLead, setSelectedLead] = useState<any>(null)

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

  const { data: leads, loading, error } = usePolling<any[]>(fetcher, 15000, [])

  const leadsByStatus: Record<string, any[]> = {}
  STAGES.forEach((s) => { leadsByStatus[s.key] = [] })
  leads?.forEach((l: any) => {
    if (l.status && leadsByStatus[l.status]) {
      leadsByStatus[l.status].push(l)
    }
  })

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

      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 12, alignItems: 'flex-start' }}>
        {STAGES.map((stage) => {
          const stageLeads = leadsByStatus[stage.key] || []
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
                <span style={{
                  background: 'var(--bg-secondary)', borderRadius: 10,
                  padding: '1px 7px', fontSize: 11, fontFamily: 'monospace',
                  fontWeight: 'bold', color: 'var(--text-primary)'
                }}>
                  {stageLeads.length}
                </span>
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
                    onClick={() => setSelectedLead(lead)}
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
              borderRadius: 12, padding: 28, maxWidth: 580, width: '90%',
              maxHeight: '82vh', overflowY: 'auto', position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
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

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <PriorityBadge priority={selectedLead.priority} />
              <StatusBadge status={selectedLead.status} />
            </div>

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
