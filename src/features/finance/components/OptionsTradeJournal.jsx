import { useState, useMemo } from 'react'
import { Plus, TrendingUp, TrendingDown, X, Loader2, BarChart2, Target } from 'lucide-react'
import { format } from 'date-fns'

const OPTION_TYPES = ['CE', 'PE']
const TRADE_ACTIONS = ['BUY', 'SELL']
const TRADE_STATUS = ['OPEN', 'CLOSED', 'EXPIRED']

export function OptionsTradeJournal({ optionsTrades, onAdd, onUpdate }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [form, setForm] = useState({
    symbol: '', option_type: 'CE', strike_price: '', expiry_date: '',
    action: 'BUY', quantity: '', lot_size: '', entry_price: '', exit_price: '',
    status: 'OPEN', trade_date: new Date().toISOString().split('T')[0],
    brokerage: '', notes: '',
  })

  const stats = useMemo(() => {
    const closed = optionsTrades.filter(t => t.status === 'CLOSED')
    const winners = closed.filter(t => (t.pnl || 0) > 0)
    const totalPnL = closed.reduce((s, t) => s + (t.pnl || 0), 0)
    const winRate = closed.length > 0 ? (winners.length / closed.length) * 100 : 0
    return { totalPnL, winRate, totalTrades: optionsTrades.length, closedTrades: closed.length }
  }, [optionsTrades])

  const filtered = filterStatus === 'ALL' ? optionsTrades : optionsTrades.filter(t => t.status === filterStatus)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const qty = parseInt(form.quantity) || 0
    const lot = parseInt(form.lot_size) || 1
    const entry = parseFloat(form.entry_price) || 0
    const exit = parseFloat(form.exit_price) || 0
    const pnl = form.status === 'CLOSED' && exit
      ? (form.action === 'BUY' ? (exit - entry) : (entry - exit)) * qty * lot - (parseFloat(form.brokerage) || 0)
      : null

    const { error } = await onAdd({
      ...form,
      strike_price: parseFloat(form.strike_price) || 0,
      quantity: qty,
      lot_size: lot,
      entry_price: entry,
      exit_price: exit || null,
      brokerage: parseFloat(form.brokerage) || 0,
      pnl,
    })
    setLoading(false)
    if (!error) {
      setOpen(false)
      setForm({ symbol: '', option_type: 'CE', strike_price: '', expiry_date: '', action: 'BUY', quantity: '', lot_size: '', entry_price: '', exit_price: '', status: 'OPEN', trade_date: new Date().toISOString().split('T')[0], brokerage: '', notes: '' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold" style={{fontFamily:'Space Grotesk'}}>Options Journal</h3>
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium">
          <Plus size={15} /> New Trade
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            {stats.totalPnL >= 0 ? <TrendingUp size={16} className="text-green-600" /> : <TrendingDown size={16} className="text-red-600" />}
            <span className="text-xs text-muted-foreground">Total P&L</span>
          </div>
          <p className={`font-bold text-xl ${stats.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`} style={{fontFamily:'Space Grotesk'}}>
            {stats.totalPnL >= 0 ? '+' : ''}₹{Math.round(stats.totalPnL).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Target size={16} className="text-blue-600" />
            <span className="text-xs text-muted-foreground">Win Rate</span>
          </div>
          <p className="font-bold text-xl text-blue-600" style={{fontFamily:'Space Grotesk'}}>{stats.winRate.toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground">{stats.closedTrades} closed trades</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5">
        {['ALL', 'OPEN', 'CLOSED', 'EXPIRED'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filterStatus === s ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Trades */}
      <div className="space-y-2">
        {filtered.map(t => {
          const isProfit = (t.pnl || 0) > 0
          return (
            <div key={t.id} className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{t.symbol}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${t.option_type === 'CE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.option_type}</span>
                    <span className="text-xs text-muted-foreground">₹{t.strike_price}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${t.action === 'BUY' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{t.action}</span>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    <span>Entry: ₹{t.entry_price}</span>
                    {t.exit_price && <span>Exit: ₹{t.exit_price}</span>}
                    <span>Qty: {t.quantity}</span>
                    {t.expiry_date && <span>Exp: {format(new Date(t.expiry_date), 'dd MMM')}</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    t.status === 'OPEN' ? 'bg-blue-100 text-blue-700'
                    : t.status === 'CLOSED' ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                  }`}>{t.status}</span>
                  {t.pnl !== null && (
                    <p className={`font-bold text-sm mt-1 ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                      {isProfit ? '+' : ''}₹{Math.round(t.pnl).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {filtered.length === 0 && (
          <div className="text-center py-8 bg-white rounded-xl border border-dashed border-border">
            <BarChart2 size={28} className="text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No trades recorded</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h3 className="font-semibold" style={{fontFamily:'Space Grotesk'}}>Record Options Trade</h3>
              <button onClick={() => setOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Symbol *</label>
                  <input required value={form.symbol} onChange={e => setForm(p => ({...p, symbol: e.target.value.toUpperCase()}))} placeholder="NIFTY, BANKNIFTY..." className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Option Type</label>
                  <div className="flex gap-2">
                    {['CE', 'PE'].map(t => (
                      <button key={t} type="button" onClick={() => setForm(p => ({...p, option_type: t}))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${form.option_type === t ? (t === 'CE' ? 'bg-green-500 text-white border-green-500' : 'bg-red-500 text-white border-red-500') : 'border-border text-muted-foreground'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Strike Price</label>
                  <input type="number" value={form.strike_price} onChange={e => setForm(p => ({...p, strike_price: e.target.value}))} placeholder="18000" className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Expiry</label>
                  <input type="date" value={form.expiry_date} onChange={e => setForm(p => ({...p, expiry_date: e.target.value}))} className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Trade Date</label>
                  <input type="date" value={form.trade_date} onChange={e => setForm(p => ({...p, trade_date: e.target.value}))} className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Action</label>
                  <div className="flex gap-2">
                    {['BUY', 'SELL'].map(a => (
                      <button key={a} type="button" onClick={() => setForm(p => ({...p, action: a}))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${form.action === a ? (a === 'BUY' ? 'bg-blue-500 text-white border-blue-500' : 'bg-orange-500 text-white border-orange-500') : 'border-border text-muted-foreground'}`}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))} className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {TRADE_STATUS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Quantity (lots)</label>
                  <input type="number" value={form.quantity} onChange={e => setForm(p => ({...p, quantity: e.target.value}))} placeholder="1" className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Lot Size</label>
                  <input type="number" value={form.lot_size} onChange={e => setForm(p => ({...p, lot_size: e.target.value}))} placeholder="50" className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Entry Price (₹)</label>
                  <input type="number" step="0.05" value={form.entry_price} onChange={e => setForm(p => ({...p, entry_price: e.target.value}))} placeholder="150" className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Exit Price (₹)</label>
                  <input type="number" step="0.05" value={form.exit_price} onChange={e => setForm(p => ({...p, exit_price: e.target.value}))} placeholder="200" className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Brokerage (₹)</label>
                <input type="number" value={form.brokerage} onChange={e => setForm(p => ({...p, brokerage: e.target.value}))} placeholder="40" className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Trade Notes</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} placeholder="Setup, thesis, lessons learned..." rows={2} className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold flex items-center justify-center gap-2">
                {loading && <Loader2 size={16} className="animate-spin" />}
                Save Trade
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}