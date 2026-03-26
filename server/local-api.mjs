import express from 'express'
import { readFileSync, existsSync } from 'fs'
import { execSync } from 'child_process'
import { homedir } from 'os'
import { join } from 'path'

const app = express()
const PORT = 7778
const CRON_DIR = join(homedir(), '.openclaw', 'cron')

app.use(express.json())

// GET /local/health
app.get('/local/health', (req, res) => {
  res.json({ ok: true, status: 'live', version: 'openclaw' })
})

// GET /local/cron/jobs
app.get('/local/cron/jobs', (req, res) => {
  try {
    const jobsPath = join(CRON_DIR, 'jobs.json')
    if (!existsSync(jobsPath)) {
      return res.json({ jobs: [] })
    }
    const raw = readFileSync(jobsPath, 'utf8')
    const data = JSON.parse(raw)
    // Support both {jobs:[...]} and [...] formats
    const jobs = Array.isArray(data) ? data : (data.jobs ?? [])
    res.json({ jobs })
  } catch (e) {
    console.error('Error reading jobs.json:', e)
    res.status(500).json({ error: String(e) })
  }
})

// GET /local/cron/runs/:jobId
app.get('/local/cron/runs/:jobId', (req, res) => {
  try {
    const { jobId } = req.params
    // Sanitize jobId - only allow UUID-like characters
    if (!/^[\w\-]+$/.test(jobId)) {
      return res.status(400).json({ error: 'Invalid jobId' })
    }
    const runsPath = join(CRON_DIR, 'runs', `${jobId}.jsonl`)
    if (!existsSync(runsPath)) {
      return res.json({ runs: [] })
    }
    const raw = readFileSync(runsPath, 'utf8')
    const lines = raw.trim().split('\n').filter(Boolean)
    // Last 30 lines
    const last30 = lines.slice(-30)
    const runs = last30.map(line => {
      try { return JSON.parse(line) } catch { return null }
    }).filter(Boolean).reverse() // newest first
    res.json({ runs })
  } catch (e) {
    console.error('Error reading runs:', e)
    res.status(500).json({ error: String(e) })
  }
})

// POST /local/cron/trigger/:jobId
app.post('/local/cron/trigger/:jobId', (req, res) => {
  const { jobId } = req.params
  if (!/^[\w\-]+$/.test(jobId)) {
    return res.status(400).json({ error: 'Invalid jobId' })
  }
  try {
    execSync(`openclaw cron run ${jobId}`, { timeout: 5000 })
    res.json({ ok: true, message: `Triggered job ${jobId}` })
  } catch (e) {
    // best effort — might fail if openclaw not in PATH or job doesn't exist
    console.error('Trigger error:', e)
    res.json({ ok: false, message: String(e) })
  }
})

app.listen(PORT, () => {
  console.log(`[local-api] Running on http://localhost:${PORT}`)
})
