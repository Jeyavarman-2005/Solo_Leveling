import { useState } from 'react'
import { Plus, Trash2, Dumbbell, Clock, Flame, ChevronDown, X, Loader2 } from 'lucide-react'
import { format, isToday, parseISO } from 'date-fns'

const WORKOUT_TYPES = [
  'Strength Training', 'Cardio', 'HIIT', 'Yoga', 'Swimming',
  'Running', 'Cycling', 'Boxing', 'Calisthenics', 'Sports', 'Other'
]
const MUSCLE_GROUPS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Full Body', 'Glutes']

export function WorkoutLogger({ workouts, onAdd, onDelete }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    workout_type: 'Strength Training',
    muscle_groups: [],
    duration_minutes: '',
    calories_burned: '',
    sets: '',
    reps: '',
    weight_kg: '',
    notes: '',
    intensity: 'medium',
  })

  const todayWorkouts = workouts.filter(w => isToday(new Date(w.created_at)))

  const toggle = (list, item) => list.includes(item) ? list.filter(i => i !== item) : [...list, item]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await onAdd({
      ...form,
      duration_minutes: parseInt(form.duration_minutes) || 0,
      calories_burned: parseInt(form.calories_burned) || 0,
      sets: parseInt(form.sets) || null,
      reps: parseInt(form.reps) || null,
      weight_kg: parseFloat(form.weight_kg) || null,
    })
    setLoading(false)
    if (!error) {
      setOpen(false)
      setForm({ workout_type: 'Strength Training', muscle_groups: [], duration_minutes: '', calories_burned: '', sets: '', reps: '', weight_kg: '', notes: '', intensity: 'medium' })
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold" style={{fontFamily:'Space Grotesk'}}>Workout Log</h3>
          <p className="text-xs text-muted-foreground">{todayWorkouts.length} sessions today</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-sm shadow-blue-500/25"
        >
          <Plus size={16} />
          Log Workout
        </button>
      </div>

      {/* Today's summary */}
      {todayWorkouts.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Sessions', value: todayWorkouts.length, icon: Dumbbell },
            { label: 'Minutes', value: todayWorkouts.reduce((s, w) => s + (w.duration_minutes || 0), 0), icon: Clock },
            { label: 'Calories', value: todayWorkouts.reduce((s, w) => s + (w.calories_burned || 0), 0), icon: Flame },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl p-3 border border-border text-center">
              <Icon size={16} className="text-primary mx-auto mb-1" />
              <p className="font-bold text-lg" style={{fontFamily:'Space Grotesk'}}>{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Workout list */}
      <div className="space-y-2">
        {workouts.slice(0, 10).map(w => (
          <div key={w.id} className="bg-white rounded-xl p-4 border border-border flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <Dumbbell size={18} className="text-green-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm">{w.workout_type}</p>
                {isToday(new Date(w.created_at)) && (
                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Today</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                {w.duration_minutes > 0 && <span>{w.duration_minutes} min</span>}
                {w.calories_burned > 0 && <span>{w.calories_burned} kcal</span>}
                {w.muscle_groups?.length > 0 && <span>{w.muscle_groups.join(', ')}</span>}
              </div>
              {w.notes && <p className="text-xs text-muted-foreground mt-1 truncate">{w.notes}</p>}
              <p className="text-xs text-muted-foreground/60 mt-0.5">{format(new Date(w.created_at), 'MMM d, h:mm a')}</p>
            </div>
            <button onClick={() => onDelete(w.id)} className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {workouts.length === 0 && (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-border">
            <Dumbbell size={32} className="text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No workouts logged yet</p>
            <p className="text-xs text-muted-foreground/60">Start your first session</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h3 className="font-semibold" style={{fontFamily:'Space Grotesk'}}>Log Workout</h3>
              <button onClick={() => setOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Workout type */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Workout Type</label>
                <select
                  value={form.workout_type}
                  onChange={e => setForm(p => ({...p, workout_type: e.target.value}))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {WORKOUT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              {/* Intensity */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Intensity</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map(i => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setForm(p => ({...p, intensity: i}))}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize border transition-all ${
                        form.intensity === i
                          ? i === 'high' ? 'bg-red-500 text-white border-red-500'
                            : i === 'medium' ? 'bg-orange-400 text-white border-orange-400'
                            : 'bg-green-500 text-white border-green-500'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              {/* Muscle Groups */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Muscle Groups</label>
                <div className="flex flex-wrap gap-2">
                  {MUSCLE_GROUPS.map(mg => (
                    <button
                      key={mg}
                      type="button"
                      onClick={() => setForm(p => ({...p, muscle_groups: toggle(p.muscle_groups, mg)}))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        form.muscle_groups.includes(mg)
                          ? 'bg-primary text-white border-primary'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      {mg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration & Calories */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Duration (min)</label>
                  <input
                    type="number"
                    value={form.duration_minutes}
                    onChange={e => setForm(p => ({...p, duration_minutes: e.target.value}))}
                    placeholder="45"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Calories Burned</label>
                  <input
                    type="number"
                    value={form.calories_burned}
                    onChange={e => setForm(p => ({...p, calories_burned: e.target.value}))}
                    placeholder="300"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Sets / Reps / Weight */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Sets</label>
                  <input
                    type="number"
                    value={form.sets}
                    onChange={e => setForm(p => ({...p, sets: e.target.value}))}
                    placeholder="4"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Reps</label>
                  <input
                    type="number"
                    value={form.reps}
                    onChange={e => setForm(p => ({...p, reps: e.target.value}))}
                    placeholder="12"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.weight_kg}
                    onChange={e => setForm(p => ({...p, weight_kg: e.target.value}))}
                    placeholder="60"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(p => ({...p, notes: e.target.value}))}
                  placeholder="How did it feel? PRs? Anything to note..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl gradient-primary text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Save Workout
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}