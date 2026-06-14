import { useState, useMemo } from 'react'
import { Plus, Trash2, Apple, X, Loader2, Utensils } from 'lucide-react'
import { format, isToday } from 'date-fns'

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-Workout', 'Post-Workout']
const MACRO_GOALS = { calories: 2500, protein: 150, carbs: 300, fat: 80 }

function MacroBar({ label, current, goal, color }) {
  const pct = Math.min((current / goal) * 100, 100)
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{Math.round(current)}/{goal}g</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function MacroTracker({ foodLogs, onAdd, onDelete }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    food_name: '', meal_type: 'Breakfast', calories: '',
    protein_g: '', carbs_g: '', fat_g: '', fiber_g: '', quantity: '1', unit: 'serving'
  })

  const todayLogs = useMemo(() =>
    foodLogs.filter(f => isToday(new Date(f.logged_at))), [foodLogs])

  const todayTotals = useMemo(() =>
    todayLogs.reduce((acc, f) => ({
      calories: acc.calories + (f.calories || 0),
      protein: acc.protein + (f.protein_g || 0),
      carbs: acc.carbs + (f.carbs_g || 0),
      fat: acc.fat + (f.fat_g || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 }), [todayLogs])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await onAdd({
      ...form,
      calories: parseInt(form.calories) || 0,
      protein_g: parseFloat(form.protein_g) || 0,
      carbs_g: parseFloat(form.carbs_g) || 0,
      fat_g: parseFloat(form.fat_g) || 0,
      fiber_g: parseFloat(form.fiber_g) || 0,
      quantity: parseFloat(form.quantity) || 1,
      logged_at: new Date().toISOString(),
    })
    setLoading(false)
    if (!error) {
      setOpen(false)
      setForm({ food_name: '', meal_type: 'Breakfast', calories: '', protein_g: '', carbs_g: '', fat_g: '', fiber_g: '', quantity: '1', unit: 'serving' })
    }
  }

  const byMeal = useMemo(() => {
    return MEAL_TYPES.reduce((acc, m) => {
      acc[m] = todayLogs.filter(f => f.meal_type === m)
      return acc
    }, {})
  }, [todayLogs])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold" style={{fontFamily:'Space Grotesk'}}>Food & Macros</h3>
          <p className="text-xs text-muted-foreground">{todayLogs.length} entries today</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium shadow-sm shadow-orange-500/25"
        >
          <Plus size={16} />
          Add Food
        </button>
      </div>

      {/* Calories Ring */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="#3b82f6" strokeWidth="3"
                strokeDasharray={`${Math.min((todayTotals.calories / MACRO_GOALS.calories) * 100, 100)} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-sm font-bold leading-none">{Math.round(todayTotals.calories)}</span>
              <span className="text-[9px] text-muted-foreground">kcal</span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <MacroBar label="Protein" current={todayTotals.protein} goal={MACRO_GOALS.protein} color="bg-blue-500" />
            <MacroBar label="Carbs" current={todayTotals.carbs} goal={MACRO_GOALS.carbs} color="bg-orange-400" />
            <MacroBar label="Fat" current={todayTotals.fat} goal={MACRO_GOALS.fat} color="bg-yellow-500" />
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-3">
        {MEAL_TYPES.filter(m => byMeal[m]?.length > 0).map(meal => (
          <div key={meal} className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border">
              <span className="text-sm font-medium">{meal}</span>
              <span className="text-xs text-muted-foreground">
                {byMeal[meal].reduce((s, f) => s + (f.calories || 0), 0)} kcal
              </span>
            </div>
            <div className="divide-y divide-border">
              {byMeal[meal].map(f => (
                <div key={f.id} className="flex items-center px-4 py-2.5 gap-3">
                  <Apple size={14} className="text-orange-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{f.food_name}</p>
                    <p className="text-xs text-muted-foreground">
                      P:{Math.round(f.protein_g || 0)}g · C:{Math.round(f.carbs_g || 0)}g · F:{Math.round(f.fat_g || 0)}g
                    </p>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{f.calories} kcal</span>
                  <button onClick={() => onDelete(f.id)} className="p-1 text-muted-foreground hover:text-destructive">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        {todayLogs.length === 0 && (
          <div className="text-center py-8 bg-white rounded-xl border border-dashed border-border">
            <Utensils size={28} className="text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No food logged today</p>
          </div>
        )}
      </div>

      {/* Add Food Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h3 className="font-semibold" style={{fontFamily:'Space Grotesk'}}>Add Food Entry</h3>
              <button onClick={() => setOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Food Name *</label>
                <input
                  required
                  value={form.food_name}
                  onChange={e => setForm(p => ({...p, food_name: e.target.value}))}
                  placeholder="Chicken breast, Rice, Oats..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Meal Type</label>
                  <select
                    value={form.meal_type}
                    onChange={e => setForm(p => ({...p, meal_type: e.target.value}))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {MEAL_TYPES.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Quantity</label>
                  <div className="flex gap-2">
                    <input
                      type="number" step="0.5"
                      value={form.quantity}
                      onChange={e => setForm(p => ({...p, quantity: e.target.value}))}
                      className="w-20 px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <input
                      value={form.unit}
                      onChange={e => setForm(p => ({...p, unit: e.target.value}))}
                      placeholder="serving"
                      className="flex-1 px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Calories (kcal) *</label>
                  <input
                    required type="number"
                    value={form.calories}
                    onChange={e => setForm(p => ({...p, calories: e.target.value}))}
                    placeholder="350"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Protein (g)</label>
                  <input
                    type="number" step="0.1"
                    value={form.protein_g}
                    onChange={e => setForm(p => ({...p, protein_g: e.target.value}))}
                    placeholder="30"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Carbs (g)</label>
                  <input
                    type="number" step="0.1"
                    value={form.carbs_g}
                    onChange={e => setForm(p => ({...p, carbs_g: e.target.value}))}
                    placeholder="45"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Fat (g)</label>
                  <input
                    type="number" step="0.1"
                    value={form.fat_g}
                    onChange={e => setForm(p => ({...p, fat_g: e.target.value}))}
                    placeholder="10"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-orange-500/20"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Log Food
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}