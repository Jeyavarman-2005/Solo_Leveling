import { useState } from 'react'
import { CheckSquare, Brain, Plus, Zap, Star, Trash2, X, Loader2, TrendingUp } from 'lucide-react'
import { useTasksData } from '../hooks/useTasksData'
import { TaskEntry } from './TaskEntry'
import { SprintBoard } from './SprintBoard'

const SKILL_LEVELS = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert', 'Master']
const SKILL_CATEGORIES = ['Technical', 'Soft Skills', 'Language', 'Creative', 'Physical', 'Business', 'Finance', 'Other']

function SkillCard({ skill, onUpdate, onDelete }) {
  const levelIdx = SKILL_LEVELS.indexOf(skill.level) || 0
  const progressPct = ((levelIdx + 1) / SKILL_LEVELS.length) * 100

  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-sm">{skill.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{skill.category}</span>
            <span className="text-xs text-muted-foreground">{skill.level}</span>
          </div>
        </div>
        <button onClick={() => onDelete(skill.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
          <Trash2 size={14} />
        </button>
      </div>

      {skill.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{skill.description}</p>}

      <div className="h-2 bg-muted rounded-full overflow-hidden mb-1.5">
        <div className="h-full bg-purple-500 rounded-full transition-all" style={{width:`${progressPct}%`}} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mb-3">
        <span>Beginner</span>
        <span>Master</span>
      </div>

      {/* Level up / down */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            const newIdx = Math.max(0, levelIdx - 1)
            onUpdate(skill.id, { level: SKILL_LEVELS[newIdx] })
          }}
          disabled={levelIdx === 0}
          className="flex-1 py-1.5 text-xs rounded-lg border border-border text-muted-foreground disabled:opacity-40 hover:bg-muted"
        >
          ↓ Downgrade
        </button>
        <button
          onClick={() => {
            const newIdx = Math.min(SKILL_LEVELS.length - 1, levelIdx + 1)
            onUpdate(skill.id, { level: SKILL_LEVELS[newIdx] })
          }}
          disabled={levelIdx === SKILL_LEVELS.length - 1}
          className="flex-1 py-1.5 text-xs rounded-lg bg-purple-600 text-white disabled:opacity-40"
        >
          ↑ Level Up
        </button>
      </div>

      {skill.resources && (
        <a href={skill.resources} target="_blank" rel="noopener noreferrer"
          className="text-xs text-primary hover:underline mt-2 block truncate"
        >
          📚 {skill.resources}
        </a>
      )}
    </div>
  )
}

function AddSkillModal({ onAdd, onClose }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'Technical', level: 'Beginner', description: '', resources: '', target_level: 'Advanced', daily_practice_minutes: '' })
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await onAdd({ ...form, daily_practice_minutes: parseInt(form.daily_practice_minutes) || 0 })
    setLoading(false)
    if (!error) onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <h3 className="font-semibold" style={{fontFamily:'Space Grotesk'}}>Add Skill</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Skill Name *</label>
            <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="React, Python, Public Speaking..." className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {SKILL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Current Level</label>
              <select value={form.level} onChange={e => setForm(p => ({...p, level: e.target.value}))} className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {SKILL_LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Target Level</label>
              <select value={form.target_level} onChange={e => setForm(p => ({...p, target_level: e.target.value}))} className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {SKILL_LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Daily Practice (min)</label>
              <input type="number" value={form.daily_practice_minutes} onChange={e => setForm(p => ({...p, daily_practice_minutes: e.target.value}))} placeholder="30" className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description / Notes</label>
            <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Why learning this, what to focus on..." rows={2} className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Resources / URL</label>
            <input value={form.resources} onChange={e => setForm(p => ({...p, resources: e.target.value}))} placeholder="https://course-link.com" className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold flex items-center justify-center gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />} Add Skill
          </button>
        </form>
      </div>
    </div>
  )
}

export function ProductivityDashboard() {
  const [tab, setTab] = useState('tasks')
  const [addTask, setAddTask] = useState(false)
  const [addSkill, setAddSkill] = useState(false)
  const { tasks, skills, loading, addTask: onAddTask, updateTask, deleteTask, toggleTask, addSkill: onAddSkill, updateSkill, deleteSkill } = useTasksData()

  const completedToday = tasks.filter(t => t.completed).length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedToday / totalTasks) * 100) : 0

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{fontFamily:'Space Grotesk'}}>Productivity</h1>
          <p className="text-sm text-muted-foreground">Tasks, skills & daily goals</p>
        </div>
        <button
          onClick={() => tab === 'tasks' ? setAddTask(true) : setAddSkill(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-sm shadow-blue-500/25"
        >
          <Plus size={16} />
          {tab === 'tasks' ? 'New Task' : 'Add Skill'}
        </button>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-500" />
            <span className="text-sm font-medium">Task Completion</span>
          </div>
          <span className="text-sm font-bold text-primary">{completionRate}%</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full gradient-primary rounded-full transition-all" style={{width:`${completionRate}%`}} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{completedToday} of {totalTasks} tasks done</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1">
        {[
          { id: 'tasks', label: 'Sprint Board', icon: CheckSquare },
          { id: 'skills', label: 'Skills', icon: Brain },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === id ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {tab === 'tasks' && (
            <SprintBoard tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} onUpdate={updateTask} />
          )}
          {tab === 'skills' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Total Skills', value: skills.length },
                  { label: 'Advanced+', value: skills.filter(s => ['Advanced', 'Expert', 'Master'].includes(s.level)).length },
                  { label: 'In Progress', value: skills.filter(s => !['Master'].includes(s.level)).length },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white rounded-xl border border-border p-3 text-center">
                    <p className="text-xl font-bold text-purple-600" style={{fontFamily:'Space Grotesk'}}>{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {skills.map(skill => (
                  <SkillCard key={skill.id} skill={skill} onUpdate={updateSkill} onDelete={deleteSkill} />
                ))}
              </div>
              {skills.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-border">
                  <Brain size={28} className="text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No skills tracked yet</p>
                  <p className="text-xs text-muted-foreground/60">Add your first skill to level up</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {addTask && <TaskEntry onAdd={onAddTask} onClose={() => setAddTask(false)} />}
      {addSkill && <AddSkillModal onAdd={onAddSkill} onClose={() => setAddSkill(false)} />}
    </div>
  )
}