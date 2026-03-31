import { useCallback } from 'react'
import { RefreshCw, Play, CheckCircle, XCircle, Clock } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { convexApi } from '../lib/convex-api'
import { oc } from '../lib/openclaw-api'
import { usePolling } from '../lib/usePolling'

interface AgentRun {
  _id: string
  agentId: string
  runAt: number
  status: 'running' | 'ok' | 'error' | 'timeout'
  durationMs: number
  summary: string
  leadsNew: number
  leadsUpdated: number
  errorMessage: string
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'ok' ? '#10B981' : status === 'error' ? '#DC2626' : status === 'running' ? '#F59E0B' : '#9CA3AF'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      color, fontFamily: 'system-ui', fontSize: 12, fontWeight: 600
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%', background: color,
        display: 'inline-block'
      }} />
      {status}
    </span>
  )
}

function formatDuration(ms: number) {
  if (!ms) return '—'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

export default function Scraper() {
  const runsFetcher = useCallback(() => convexApi.agentRuns.byAgent('scraper', 30), [])
  const todayFetcher = useCallback(() => convexApi.leads.getToday(), [])
  const cronsFetcher = useCallback(() => oc.cronJobs(), [])

  const { data: runs, refresh: refreshRuns } = usePolling<AgentRun[]>(runsFetcher, 30000, [])
  const { data: todayLeads } = usePolling<any[]>(todayFetcher, 30000, [])
  const { data: cronsData } = usePolling(cronsFetcher, 30000)

  const scraperCron = (cronsData as any)?.jobs?.find(
    (j: any) => j.name?.toLowerCase().includes('scraper') || j.id?.includes('scraper')
  )

  const okRuns = runs?.filter((r) => r.status === 'ok') ?? []
  const errorRuns = runs?.filter((r) => r.status === 'error') ?? []
  const validRuns = okRuns.filter(r => r.durationMs < 1800000)
  const avgDuration = validRuns.length > 0
    ? Math.round(validRuns.reduce((s, r) => s + r.durationMs, 0) / validRuns.length)
    : 0
  const lastRun = runs?.[0]

  const triggerScraper = async () => {
    if (!scraperCron?.id) return
    try {
      await oc.triggerCron(scraperCron.id)
      setTimeout(refreshRuns, 3000)
    } catch (e) {
      alert('Error triggering scraper: ' + e)
    }
  }

  return (
    <div>
      <PageHeader
        title="Scraper"
        subtitle="Facebook lead scraper — histórico de runs e leads de hoje"
        actions={
          scraperCron && (
            <button
              onClick={triggerScraper}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'var(--accent)', color: 'white',
                border: 'none', borderRadius: 6, padding: '8px 16px',
                cursor: 'pointer', fontSize: 13, fontFamily: 'system-ui',
                fontWeight: 600
              }}
            >
              <Play size={14} /> Run Now
            </button>
          )
        }
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Hoje" value={todayLeads?.length || 0} icon={RefreshCw} sub="leads capturados" />
        <StatCard
          label="Último Run"
          value={lastRun ? lastRun.status : '—'}
          icon={lastRun?.status === 'ok' ? CheckCircle : XCircle}
          accent={lastRun?.status === 'error'}
          sub={lastRun ? new Date(lastRun.runAt).toLocaleTimeString('pt-BR') : ''}
        />
        <StatCard label="Erros (30 runs)" value={errorRuns.length} icon={XCircle} accent={errorRuns.length > 0} sub={`de ${runs?.length ?? 0} runs`} />
        <StatCard label="Duração Média" value={formatDuration(avgDuration)} icon={Clock} sub="runs com sucesso" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>

        {/* Run history table */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, overflow: 'hidden'
        }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <h3 style={{
              fontFamily: 'Georgia,serif', fontSize: 14, fontWeight: 'bold',
              color: 'var(--text-secondary)', margin: 0
            }}>Histórico de Runs</h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'system-ui' }}>
              últimos {runs?.length || 0}
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  {['Horário', 'Status', 'Novos', 'Atualizados', 'Duração', 'Resumo'].map((h) => (
                    <th key={h} style={{
                      padding: '8px 12px', textAlign: 'left',
                      fontFamily: 'system-ui', fontWeight: 600, fontSize: 11,
                      color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8,
                      borderBottom: '1px solid var(--border)'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(!runs || runs.length === 0) && (
                  <tr>
                    <td colSpan={6} style={{
                      padding: '24px 12px', textAlign: 'center',
                      color: 'var(--text-muted)', fontFamily: 'system-ui'
                    }}>Sem runs ainda...</td>
                  </tr>
                )}
                {runs?.map((run) => (
                  <tr key={run._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '9px 12px', fontFamily: 'monospace', fontSize: 11 }}>
                      {new Date(run.runAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td style={{ padding: '9px 12px' }}>
                      <StatusDot status={run.status} />
                    </td>
                    <td style={{ padding: '9px 12px', fontFamily: 'monospace', color: '#10B981', fontWeight: 600 }}>
                      +{run.leadsNew}
                    </td>
                    <td style={{ padding: '9px 12px', fontFamily: 'monospace', color: '#3B82F6' }}>
                      ~{run.leadsUpdated}
                    </td>
                    <td style={{ padding: '9px 12px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>
                      {formatDuration(run.durationMs)}
                    </td>
                    <td style={{
                      padding: '9px 12px', fontFamily: 'system-ui', fontSize: 11,
                      color: run.status === 'error' ? '#DC2626' : 'var(--text-muted)',
                      maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {run.status === 'error' ? run.errorMessage : run.summary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's leads */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, padding: 16
        }}>
          <h3 style={{
            fontFamily: 'Georgia,serif', fontSize: 14, fontWeight: 'bold',
            color: 'var(--text-secondary)', margin: '0 0 12px'
          }}>Leads de Hoje</h3>

          {(!todayLeads || todayLeads.length === 0) && (
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'system-ui' }}>
              Nenhum lead capturado hoje.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 520, overflowY: 'auto' }}>
            {todayLeads?.map((lead: any) => (
              <div key={lead._id} style={{
                padding: '10px 12px', background: 'var(--bg-secondary)',
                borderRadius: 6, border: '1px solid var(--border)'
              }}>
                <div style={{
                  fontFamily: 'system-ui', fontSize: 12, fontWeight: 600,
                  marginBottom: 4, color: 'var(--text-primary)'
                }}>
                  {lead.authorName}
                </div>
                <div style={{
                  fontSize: 11, color: 'var(--text-muted)', fontFamily: 'system-ui',
                  marginBottom: 4
                }}>
                  {lead.groupName || 'Feed'}
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 10, padding: '1px 6px', borderRadius: 3,
                    background: lead.priority === 'hot' ? '#FEF2F2' : lead.priority === 'warm' ? '#FFFBEB' : '#EFF6FF',
                    color: lead.priority === 'hot' ? '#DC2626' : lead.priority === 'warm' ? '#D97706' : '#2563EB',
                    fontFamily: 'system-ui', fontWeight: 600
                  }}>
                    {lead.priority}
                  </span>
                  {lead.notionSynced && (
                    <span style={{
                      fontSize: 10, color: '#059669', fontFamily: 'system-ui'
                    }}>✓ Notion</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
