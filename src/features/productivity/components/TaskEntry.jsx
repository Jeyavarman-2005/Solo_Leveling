import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'

const PRIORITIES = ['low', 'medium', 'high', 'urgent']
const CATEGORIES = ['Work', 'Personal', 'Health', 'Finance', 'Learning', 'Projects', 'Errands', 'Other']

export function TaskEntry({ onAdd, onClose }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium',
    category: 'Work', due_date: '', tags: '', estimated_minutes: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await onAdd({
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      estimated_minutes: parseInt(form.estimated_minutes) || null,
      due_date: form.due_date || null,
      completed: false,
    })
    setLoading(false)
    if (!error) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <h3 className="font-semibold" style={{fontFamily:'Space Grotesk'}}>New Task</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Task Title *</label>
            <input
              required autoFocus
              value={form.title}
              onChange={e => setForm(p => ({...p, title: e.target.value}))}
              placeholder="What needs to be done?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({...p, description: e.target.value}))}
              placeholder="More context, links, steps..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Priority</label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm(prev => ({...prev, priority: p}))}
                    className={`py-2 rounded-lg text-xs font-medium capitalize border transition-all ${
                      form.priority === p
                        ? p === 'urgent' ? 'bg-red-600 text-white border-red-600'
                          : p === 'high' ? 'bg-orange-500 text-white border-orange-500'
                          : p === 'medium' ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-green-500 text-white border-green-500'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(p => ({...p, category: e.target.value}))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={e => setForm(p => ({...p, due_date: e.target.value}))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Est. Time (min)</label>
              <input
                type="number"
                value={form.estimated_minutes}
                onChange={e => setForm(p => ({...p, estimated_minutes: e.target.value}))}
                placeholder="30"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Tags (comma separated)</label>
            <input
              value={form.tags}
              onChange={e => setForm(p => ({...p, tags: e.target.value}))}
              placeholder="react, frontend, urgent"
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl gradient-primary text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Create Task
          </button>
        </form>
      </div>
    </div>
  )
}