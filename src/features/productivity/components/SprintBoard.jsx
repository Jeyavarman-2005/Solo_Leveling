import { useState } from 'react'
import { CheckSquare, Square, Trash2, Clock, AlertTriangle, Flag, Edit2, Check, X } from 'lucide-react'
import { format, isPast, isToday } from 'date-fns'

const PRIORITY_CONFIG = {
  urgent: { color: 'text-red-600', bg: 'bg-red-100', icon: AlertTriangle },
  high: { color: 'text-orange-600', bg: 'bg-orange-100', icon: Flag },
  medium: { color: 'text-blue-600', bg: 'bg-blue-100', icon: Flag },
  low: { color: 'text-green-600', bg: 'bg-green-100', icon: Flag },
}

function TaskCard({ task, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium
  const PIcon = pc.icon
  const isDue = task.due_date && isPast(new Date(task.due_date)) && !task.completed
  const isDueToday = task.due_date && isToday(new Date(task.due_date))

  const saveEdit = async () => {
    if (editTitle.trim()) await onUpdate(task.id, { title: editTitle.trim() })
    setEditing(false)
  }

  return (
    <div className={`bg-white rounded-xl border p-4 transition-all ${task.completed ? 'opacity-60 border-border' : isDue ? 'border-red-200 bg-red-50/30' : 'border-border hover:border-primary/30 hover:shadow-sm'}`}>
      <div className="flex items-start gap-3">
        <button onClick={() => onToggle(task.id)} className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-primary">
          {task.completed ? <CheckSquare size={18} className="text-green-600" /> : <Square size={18} />}
        </button>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false) }}
                className="flex-1 text-sm border-b border-primary focus:outline-none bg-transparent"
              />
              <button onClick={saveEdit} className="text-green-600"><Check size={14} /></button>
              <button onClick={() => setEditing(false)} className="text-muted-foreground"><X size={14} /></button>
            </div>
          ) : (
            <p className={`text-sm font-medium leading-snug ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </p>
          )}
          {task.description && !editing && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${pc.bg} ${pc.color}`}>
              <PIcon size={10} />
              {task.priority}
            </div>
            {task.category && (
              <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{task.category}</span>
            )}
            {task.due_date && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                isDue ? 'bg-red-100 text-red-700' : isDueToday ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
              }`}>
                <Clock size={10} />
                {isDue ? 'Overdue' : isDueToday ? 'Today' : format(new Date(task.due_date), 'dd MMM')}
              </span>
            )}
            {task.estimated_minutes && (
              <span className="text-xs text-muted-foreground">{task.estimated_minutes}m</span>
            )}
            {task.tags?.map(tag => (
              <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">#{tag}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setEditing(true)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg">
            <Edit2 size={13} />
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function SprintBoard({ tasks, onToggle, onDelete, onUpdate }) {
  const [filter, setFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('All')

  const categories = ['All', ...new Set(tasks.map(t => t.category).filter(Boolean))]

  const filtered = tasks.filter(t => {
    const matchFilter = filter === 'all' ? true : filter === 'pending' ? !t.completed : t.completed
    const matchCat = categoryFilter === 'All' || t.category === categoryFilter
    return matchFilter && matchCat
  })

  const pending = filtered.filter(t => !t.completed)
  const completed = filtered.filter(t => t.completed)

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-2">
        <div className="flex gap-1.5">
          {[
            { id: 'all', label: `All (${tasks.length})` },
            { id: 'pending', label: `Active (${tasks.filter(t => !t.completed).length})` },
            { id: 'done', label: `Done (${tasks.filter(t => t.completed).length})` },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filter === id ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap flex-shrink-0 transition-all ${
                categoryFilter === cat ? 'bg-slate-800 text-white border-slate-800' : 'border-border text-muted-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Pending */}
      {(filter === 'all' || filter === 'pending') && (
        <div className="space-y-2">
          {pending.length > 0 && (
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Active · {pending.length}
            </p>
          )}
          {pending.map(task => (
            <TaskCard key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onUpdate={onUpdate} />
          ))}
        </div>
      )}

      {/* Completed */}
      {(filter === 'all' || filter === 'done') && completed.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Completed · {completed.length}
          </p>
          {completed.map(task => (
            <TaskCard key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} onUpdate={onUpdate} />
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-border">
          <CheckSquare size={28} className="text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No tasks here</p>
          <p className="text-xs text-muted-foreground/60">Create your first task above</p>
        </div>
      )}
    </div>
  )
}