import { useState, useMemo } from 'react'
import { Plus, TrendingUp, Calendar, X, Loader2, IndianRupee } from 'lucide-react'
import { format } from 'date-fns'

const FUND_CATEGORIES = ['Large Cap', 'Mid Cap', 'Small Cap', 'Flexi Cap', 'ELSS', 'Debt', 'Index Fund', 'Sectoral', 'International']

export function SIPTracker({ sipEntries, onAdd }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fund_name: '', category: 'Index Fund', monthly_amount: '',
    units: '', nav: '', investment_date: new Date().toISOString().split('T')[0],
    folio_number: '', notes: '',
  })

  const stats = useMemo(() => {
    const totalInvested = sipEntries.reduce((s, e) => s + (e.monthly_amount || 0), 0)
    const totalUnits = sipEntries.reduce((s, e) => s + (e.units || 0), 0)
    const currentValue = sipEntries.reduce((s, e) => s + ((e.units || 0) * (e.current_nav || e.nav || 0)), 0)
    const gainLoss = currentValue - totalInvested
    const gainLossPct = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0
    return { totalInvested, totalUnits, currentValue, gainLoss, gainLossPct }
  }, [sipEntries])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await onAdd({
      ...form,
      monthly_amount: parseFloat(form.monthly_amount) || 0,
      units: parseFloat(form.units) || 0,
      nav: parseFloat(form.nav) || 0,
    })
    setLoading(false)
    if (!error) {
      setOpen(false)
      setForm({ fund_name: '', category: 'Index Fund', monthly_amount: '', units: '', nav: '', investment_date: new Date().toISOString().split('T')[0], folio_number: '', notes: '' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold" style={{fontFamily:'Space Grotesk'}}>SIP Tracker</h3>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-600 text-white text-sm font-medium"
        >
          <Plus size={15} /> Add SIP
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Invested', value: `₹${stats.totalInvested.toLocaleString('en-IN')}`, color: 'text-foreground' },
          { label: 'Current Value', value: `₹${Math.round(stats.currentValue).toLocaleString('en-IN')}`, color: 'text-foreground' },
          { label: 'Gain/Loss', value: `${stats.gainLoss >= 0 ? '+' : ''}₹${Math.round(stats.gainLoss).toLocaleString('en-IN')}`, color: stats.gainLoss >= 0 ? 'text-green-600' : 'text-red-600' },
          { label: 'Returns', value: `${stats.gainLossPct >= 0 ? '+' : ''}${stats.gainLossPct.toFixed(2)}%`, color: stats.gainLossPct >= 0 ? 'text-green-600' : 'text-red-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-border">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`font-bold text-base mt-0.5 ${color}`} style={{fontFamily:'Space Grotesk'}}>{value}</p>
          </div>
        ))}
      </div>

      {/* SIP List */}
      <div className="space-y-2">
        {sipEntries.map(e => (
          <div key={e.id} className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{e.fund_name}</p>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{e.category}</span>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-sm">₹{(e.monthly_amount || 0).toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">NAV: ₹{e.nav}</p>
              </div>
            </div>
            {e.units && (
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>Units: {e.units}</span>
                <span>{format(new Date(e.investment_date), 'dd MMM yyyy')}</span>
                {e.folio_number && <span>Folio: {e.folio_number}</span>}
              </div>
            )}
          </div>
        ))}
        {sipEntries.length === 0 && (
          <div className="text-center py-8 bg-white rounded-xl border border-dashed border-border">
            <TrendingUp size={28} className="text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No SIP entries yet</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold" style={{fontFamily:'Space Grotesk'}}>Add SIP Entry</h3>
              <button onClick={() => setOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Fund Name *</label>
                <input required value={form.fund_name} onChange={e => setForm(p => ({...p, fund_name: e.target.value}))} placeholder="Mirae Asset Large Cap Fund" className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {FUND_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Monthly Amount (₹) *</label>
                  <input required type="number" value={form.monthly_amount} onChange={e => setForm(p => ({...p, monthly_amount: e.target.value}))} placeholder="5000" className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Units</label>
                  <input type="number" step="0.001" value={form.units} onChange={e => setForm(p => ({...p, units: e.target.value}))} placeholder="24.56" className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">NAV (₹)</label>
                  <input type="number" step="0.01" value={form.nav} onChange={e => setForm(p => ({...p, nav: e.target.value}))} placeholder="203.45" className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Date</label>
                  <input type="date" value={form.investment_date} onChange={e => setForm(p => ({...p, investment_date: e.target.value}))} className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Folio Number</label>
                <input value={form.folio_number} onChange={e => setForm(p => ({...p, folio_number: e.target.value}))} placeholder="1234567890" className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-green-600 text-white font-semibold flex items-center justify-center gap-2">
                {loading && <Loader2 size={16} className="animate-spin" />}
                Add SIP Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}