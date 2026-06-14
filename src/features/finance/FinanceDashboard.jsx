import { useState, useMemo } from 'react'
import {
  TrendingUp, DollarSign, PiggyBank, BarChart2,
  Plus, Trash2, X, Loader2, Target, CreditCard,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { useFinanceData } from './hooks/useFinanceData'
import { SIPTracker } from './components/SIPTracker'
import { OptionsTradeJournal } from './components/OptionsTradeJournal'
import { format } from 'date-fns'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const ASSET_TYPES = ['Stocks', 'Mutual Funds', 'Crypto', 'Gold', 'FD', 'PPF', 'NPS', 'Real Estate', 'Cash', 'Other']
const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Health', 'Education', 'Travel', 'EMI', 'Investment', 'Other']
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#f97316']

const TABS = [
  { id: 'portfolio', label: 'Portfolio', icon: TrendingUp },
  { id: 'expenses', label: 'Expenses', icon: CreditCard },
  { id: 'savings', label: 'Savings', icon: PiggyBank },
  { id: 'sip', label: 'SIP', icon: BarChart2 },
  { id: 'options', label: 'Options', icon: Target },
]

function AddPortfolioModal({ onAdd, onClose }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', asset_type: 'Stocks', quantity: '', buy_price: '', current_value: '', ticker: '', notes: '' })
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await onAdd({ ...form, quantity: parseFloat(form.quantity) || 0, buy_price: parseFloat(form.buy_price) || 0, current_value: parseFloat(form.current_value) || 0 })
    setLoading(false)
    if (!error) onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <h3 className="font-semibold" style={{fontFamily:'Space Grotesk'}}>Add Portfolio Item</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Name *</label>
              <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="Infosys, Bitcoin..." className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Asset Type</label>
              <select value={form.asset_type} onChange={e => setForm(p => ({...p, asset_type: e.target.value}))} className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {ASSET_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Ticker</label>
              <input value={form.ticker} onChange={e => setForm(p => ({...p, ticker: e.target.value.toUpperCase()}))} placeholder="INFY" className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Quantity</label>
              <input type="number" step="0.001" value={form.quantity} onChange={e => setForm(p => ({...p, quantity: e.target.value}))} placeholder="10" className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Buy Price (₹)</label>
              <input type="number" step="0.01" value={form.buy_price} onChange={e => setForm(p => ({...p, buy_price: e.target.value}))} placeholder="1500" className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Current Value (₹) *</label>
            <input required type="number" step="0.01" value={form.current_value} onChange={e => setForm(p => ({...p, current_value: e.target.value}))} placeholder="18000" className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} rows={2} className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl gradient-primary text-white font-semibold flex items-center justify-center gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />} Add to Portfolio
          </button>
        </form>
      </div>
    </div>
  )
}

function AddExpenseModal({ onAdd, onClose }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ description: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0], payment_method: 'UPI', notes: '' })
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await onAdd({ ...form, amount: parseFloat(form.amount) || 0 })
    setLoading(false)
    if (!error) onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <h3 className="font-semibold" style={{fontFamily:'Space Grotesk'}}>Add Expense</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Description *</label>
            <input required value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Grocery shopping, Zomato..." className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Amount (₹) *</label>
              <input required type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} placeholder="500" className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Payment Method</label>
              <select value={form.payment_method} onChange={e => setForm(p => ({...p, payment_method: e.target.value}))} className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {['UPI', 'Credit Card', 'Debit Card', 'Cash', 'NetBanking', 'Crypto'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-red-500 text-white font-semibold flex items-center justify-center gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />} Add Expense
          </button>
        </form>
      </div>
    </div>
  )
}

function AddSavingsModal({ onAdd, onClose }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ goal_name: '', target_amount: '', current_amount: '', deadline: '', category: 'Emergency Fund', notes: '' })
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await onAdd({ ...form, target_amount: parseFloat(form.target_amount) || 0, current_amount: parseFloat(form.current_amount) || 0 })
    setLoading(false)
    if (!error) onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <h3 className="font-semibold" style={{fontFamily:'Space Grotesk'}}>Create Savings Goal</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Goal Name *</label>
            <input required value={form.goal_name} onChange={e => setForm(p => ({...p, goal_name: e.target.value}))} placeholder="MacBook Pro, Emergency Fund..." className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Target Amount (₹) *</label>
              <input required type="number" value={form.target_amount} onChange={e => setForm(p => ({...p, target_amount: e.target.value}))} placeholder="200000" className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Current Amount (₹)</label>
              <input type="number" value={form.current_amount} onChange={e => setForm(p => ({...p, current_amount: e.target.value}))} placeholder="50000" className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {['Emergency Fund', 'Vacation', 'Gadget', 'Vehicle', 'Education', 'Business', 'House', 'Wedding', 'Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Target Date</label>
              <input type="date" value={form.deadline} onChange={e => setForm(p => ({...p, deadline: e.target.value}))} className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />} Create Goal
          </button>
        </form>
      </div>
    </div>
  )
}

export default function FinanceDashboard() {
  const [tab, setTab] = useState('portfolio')
  const [modal, setModal] = useState(null)
  const { portfolio, expenses, savings, sipEntries, optionsTrades, loading,
    addPortfolioItem, deletePortfolioItem, addExpense, deleteExpense,
    addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, addSipEntry, addOptionsTrade, updateOptionsTrade } = useFinanceData()

  const totalPortfolio = useMemo(() => portfolio.reduce((s, p) => s + (p.current_value || 0), 0), [portfolio])
  const totalCost = useMemo(() => portfolio.reduce((s, p) => s + ((p.buy_price || 0) * (p.quantity || 1)), 0), [portfolio])
  const portfolioGain = totalPortfolio - totalCost
  const portfolioGainPct = totalCost > 0 ? (portfolioGain / totalCost) * 100 : 0

  const thisMonthExpenses = useMemo(() => {
    const now = new Date()
    return expenses.filter(e => {
      const d = new Date(e.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).reduce((s, e) => s + (e.amount || 0), 0)
  }, [expenses])

  const portfolioByType = useMemo(() => {
    const map = {}
    portfolio.forEach(p => { map[p.asset_type] = (map[p.asset_type] || 0) + (p.current_value || 0) })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [portfolio])

  const expenseByCategory = useMemo(() => {
    const now = new Date()
    const map = {}
    expenses.filter(e => {
      const d = new Date(e.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).forEach(e => { map[e.category] = (map[e.category] || 0) + (e.amount || 0) })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [expenses])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{fontFamily:'Space Grotesk'}}>Finance</h1>
        <p className="text-sm text-muted-foreground">Portfolio, expenses, savings & trading journal</p>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Net Worth', value: `₹${(totalPortfolio / 100000).toFixed(2)}L`, sub: `${portfolioGainPct >= 0 ? '+' : ''}${portfolioGainPct.toFixed(1)}% overall`, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
          { label: 'Gain/Loss', value: `${portfolioGain >= 0 ? '+' : ''}₹${Math.round(portfolioGain / 1000)}K`, sub: 'on investments', color: portfolioGain >= 0 ? 'text-green-600' : 'text-red-600', bg: portfolioGain >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100' },
          { label: 'This Month', value: `₹${Math.round(thisMonthExpenses).toLocaleString('en-IN')}`, sub: 'expenses', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
          { label: 'Savings Goals', value: savings.length, sub: 'active goals', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
        ].map(({ label, value, sub, color, bg }) => (
          <div key={label} className={`rounded-xl p-4 border ${bg}`}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`font-bold text-xl mt-0.5 ${color}`} style={{fontFamily:'Space Grotesk'}}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              tab === id ? 'bg-primary text-white shadow-sm' : 'bg-white border border-border text-muted-foreground'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Portfolio Tab */}
      {tab === 'portfolio' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold" style={{fontFamily:'Space Grotesk'}}>Holdings</h3>
            <button onClick={() => setModal('portfolio')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl gradient-primary text-white text-sm font-medium">
              <Plus size={15} /> Add
            </button>
          </div>

          {portfolioByType.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-4">
              <p className="text-sm font-medium mb-3">Asset Allocation</p>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={portfolioByType} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={2}>
                      {portfolioByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`₹${Math.round(v).toLocaleString('en-IN')}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {portfolioByType.map(({ name, value }, i) => (
                    <div key={name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs flex-1">{name}</span>
                      <span className="text-xs font-medium">{((value / totalPortfolio) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {portfolio.map(p => {
              const invested = (p.buy_price || 0) * (p.quantity || 1)
              const gain = (p.current_value || 0) - invested
              const gainPct = invested > 0 ? (gain / invested) * 100 : 0
              return (
                <div key={p.id} className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center font-bold text-sm text-blue-700 flex-shrink-0">
                    {p.ticker?.[0] || p.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{p.asset_type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {p.quantity && `${p.quantity} units`} {p.buy_price && `· Avg ₹${p.buy_price}`}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-sm">₹{(p.current_value || 0).toLocaleString('en-IN')}</p>
                    {invested > 0 && (
                      <p className={`text-xs flex items-center justify-end gap-0.5 ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {gain >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                        {gainPct.toFixed(1)}%
                      </p>
                    )}
                  </div>
                  <button onClick={() => deletePortfolioItem(p.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
            {portfolio.length === 0 && (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-border">
                <TrendingUp size={28} className="text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No holdings added yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {tab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold" style={{fontFamily:'Space Grotesk'}}>Expenses</h3>
            <button onClick={() => setModal('expense')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500 text-white text-sm font-medium">
              <Plus size={15} /> Add
            </button>
          </div>

          {expenseByCategory.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-4">
              <p className="text-xs text-muted-foreground mb-3">This month by category</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={expenseByCategory} margin={{top:0, right:0, left:-20, bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{fontSize:10}} />
                  <YAxis tick={{fontSize:10}} />
                  <Tooltip formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Amount']} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-2">
            {expenses.slice(0, 30).map(e => (
              <div key={e.id} className="bg-white rounded-xl border border-border px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <CreditCard size={15} className="text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{e.description}</p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{e.category}</span>
                    <span>·</span>
                    <span>{format(new Date(e.date), 'dd MMM')}</span>
                    <span>·</span>
                    <span>{e.payment_method}</span>
                  </div>
                </div>
                <span className="font-semibold text-sm text-red-600 flex-shrink-0">-₹{e.amount.toLocaleString('en-IN')}</span>
                <button onClick={() => deleteExpense(e.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
            {expenses.length === 0 && (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-border">
                <CreditCard size={28} className="text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No expenses recorded</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Savings Tab */}
      {tab === 'savings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold" style={{fontFamily:'Space Grotesk'}}>Savings Goals</h3>
            <button onClick={() => setModal('savings')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium">
              <Plus size={15} /> New Goal
            </button>
          </div>
          <div className="space-y-3">
            {savings.map(g => {
              const pct = Math.min(((g.current_amount || 0) / (g.target_amount || 1)) * 100, 100)
              return (
                <div key={g.id} className="bg-white rounded-2xl border border-border p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{g.goal_name}</p>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{g.category}</span>
                    </div>
                    <button onClick={() => deleteSavingsGoal(g.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Saved</span>
                    <span className="font-medium">₹{(g.current_amount || 0).toLocaleString('en-IN')} / ₹{(g.target_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{width:`${pct}%`}} />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{pct.toFixed(0)}% complete</span>
                    {g.deadline && <span className="text-xs text-muted-foreground">By {format(new Date(g.deadline), 'dd MMM yyyy')}</span>}
                  </div>
                  {/* Quick add to savings */}
                  <div className="flex gap-2 mt-3">
                    {[1000, 5000, 10000].map(amt => (
                      <button
                        key={amt}
                        onClick={() => updateSavingsGoal(g.id, { current_amount: (g.current_amount || 0) + amt })}
                        className="flex-1 py-1.5 text-xs rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                      >
                        +₹{(amt/1000)}K
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
            {savings.length === 0 && (
              <div className="text-center py-10 bg-white rounded-xl border border-dashed border-border">
                <PiggyBank size={28} className="text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No savings goals yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'sip' && <SIPTracker sipEntries={sipEntries} onAdd={addSipEntry} />}
      {tab === 'options' && <OptionsTradeJournal optionsTrades={optionsTrades} onAdd={addOptionsTrade} onUpdate={updateOptionsTrade} />}

      {/* Modals */}
      {modal === 'portfolio' && <AddPortfolioModal onAdd={addPortfolioItem} onClose={() => setModal(null)} />}
      {modal === 'expense' && <AddExpenseModal onAdd={addExpense} onClose={() => setModal(null)} />}
      {modal === 'savings' && <AddSavingsModal onAdd={addSavingsGoal} onClose={() => setModal(null)} />}
    </div>
  )
}