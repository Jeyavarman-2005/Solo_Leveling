import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import {
  Heart, DollarSign, CheckSquare, TrendingUp,
  Flame, Target, Trophy, ArrowRight, Zap,
  Dumbbell, Apple, Briefcase, Brain
} from 'lucide-react'
import { format, startOfDay, isToday } from 'date-fns'
import { useHealthData } from './health/hooks/useHealthData'
import { useFinanceData } from './finance/hooks/useFinanceData'
import { useTasksData } from './productivity/hooks/useTasksData'
import { useMemo } from 'react'

function StatCard({ icon: Icon, label, value, sub, gradient, to }) {
  const content = (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white ${gradient} shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/70 text-xs font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold mt-1" style={{fontFamily:'Space Grotesk'}}>{value}</p>
          {sub && <p className="text-white/70 text-xs mt-1">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <Icon size={20} />
        </div>
      </div>
      {to && <ArrowRight size={14} className="absolute bottom-4 right-4 text-white/50" />}
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}

function QuickAction({ icon: Icon, label, to, color }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-border hover:border-primary/30 hover:shadow-md transition-all">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <span className="text-xs font-medium text-center leading-tight">{label}</span>
    </Link>
  )
}

export default function UnifiedDashboard() {
  const { user } = useAuth()
  const { workouts, foodLogs, loading: hLoading } = useHealthData()
  const { portfolio, expenses, savings, loading: fLoading } = useFinanceData()
  const { tasks, loading: tLoading } = useTasksData()

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Champion'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const stats = useMemo(() => {
    const todayWorkouts = workouts?.filter(w => isToday(new Date(w.created_at))) || []
    const todayFood = foodLogs?.filter(f => isToday(new Date(f.logged_at))) || []
    const totalCalories = todayFood.reduce((s, f) => s + (f.calories || 0), 0)
    const totalPortfolioValue = portfolio?.reduce((s, p) => s + (p.current_value || 0), 0) || 0
    const totalExpenses = expenses?.filter(e => {
      const d = new Date(e.date)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).reduce((s, e) => s + (e.amount || 0), 0) || 0
    const totalSavings = savings?.reduce((s, sv) => s + (sv.current_amount || 0), 0) || 0
    const pendingTasks = tasks?.filter(t => !t.completed).length || 0
    const completedToday = tasks?.filter(t => t.completed && isToday(new Date(t.updated_at))).length || 0

    return { todayWorkouts, totalCalories, totalPortfolioValue, totalExpenses, totalSavings, pendingTasks, completedToday }
  }, [workouts, foodLogs, portfolio, expenses, savings, tasks])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{greeting} 👋</p>
          <h1 className="text-2xl font-bold mt-0.5" style={{fontFamily:'Space Grotesk'}}>
            {firstName}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl border border-amber-200">
          <Flame size={14} className="text-amber-500" />
          <span className="text-xs font-semibold">Level Up Mode</span>
        </div>
      </div>

      {/* Hero stat */}
      <div className="gradient-primary rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px'}} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-yellow-300" />
            <span className="text-white/80 text-xs font-medium uppercase tracking-wider">Today's Progress</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-3xl font-bold" style={{fontFamily:'Space Grotesk'}}>{stats.completedToday}</p>
              <p className="text-white/70 text-xs">Tasks Done</p>
            </div>
            <div>
              <p className="text-3xl font-bold" style={{fontFamily:'Space Grotesk'}}>{stats.todayWorkouts.length}</p>
              <p className="text-white/70 text-xs">Workouts</p>
            </div>
            <div>
              <p className="text-3xl font-bold" style={{fontFamily:'Space Grotesk'}}>{stats.totalCalories}</p>
              <p className="text-white/70 text-xs">Calories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Heart}
          label="Workouts Today"
          value={stats.todayWorkouts.length}
          sub="sessions logged"
          gradient="gradient-success"
          to="/health"
        />
        <StatCard
          icon={CheckSquare}
          label="Pending Tasks"
          value={stats.pendingTasks}
          sub="to complete"
          gradient="gradient-primary"
          to="/productivity"
        />
        <StatCard
          icon={DollarSign}
          label="Portfolio"
          value={`₹${(stats.totalPortfolioValue / 1000).toFixed(0)}K`}
          sub="total value"
          gradient="gradient-warning"
          to="/finance"
        />
        <StatCard
          icon={TrendingUp}
          label="Savings"
          value={`₹${(stats.totalSavings / 1000).toFixed(0)}K`}
          sub="total saved"
          gradient="gradient-purple"
          to="/finance"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Access</h2>
        <div className="grid grid-cols-4 gap-2">
          <QuickAction icon={Dumbbell} label="Log Workout" to="/health" color="bg-green-100 text-green-700" />
          <QuickAction icon={Apple} label="Track Food" to="/health" color="bg-orange-100 text-orange-700" />
          <QuickAction icon={CheckSquare} label="Add Task" to="/productivity" color="bg-blue-100 text-blue-700" />
          <QuickAction icon={Briefcase} label="Finance" to="/finance" color="bg-purple-100 text-purple-700" />
        </div>
      </div>

      {/* Pending tasks preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{fontFamily:'Space Grotesk'}}>Today's Focus</h2>
          <Link to="/productivity" className="text-xs text-primary hover:underline flex items-center gap-1">
            See all <ArrowRight size={12} />
          </Link>
        </div>
        <div className="space-y-2">
          {!tLoading && tasks?.filter(t => !t.completed).slice(0, 4).map(task => (
            <div key={task.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-border">
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              <span className="text-sm flex-1 truncate">{task.title}</span>
              {task.priority === 'high' && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">High</span>
              )}
            </div>
          ))}
          {(!tasks?.filter(t => !t.completed).length && !tLoading) && (
            <div className="bg-green-50 rounded-xl px-4 py-4 text-center border border-green-100">
              <Trophy size={20} className="text-green-600 mx-auto mb-1" />
              <p className="text-sm text-green-700 font-medium">All tasks done! 🎉</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}