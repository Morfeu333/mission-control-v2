import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Pipeline from './pages/Pipeline'
import Scraper from './pages/Scraper'
import SDRInbox from './pages/SDRInbox'
import Agents from './pages/Agents'
import Crons from './pages/Crons'
import Memory from './pages/Memory'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Sidebar />
        <main style={{ marginLeft: '220px', flex: 1, padding: '24px', minHeight: '100vh', overflowX: 'hidden' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/scraper" element={<Scraper />} />
            <Route path="/sdr" element={<SDRInbox />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/crons" element={<Crons />} />
            <Route path="/memory" element={<Memory />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
