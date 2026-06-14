import { useState } from 'react'
import { Dumbbell, Utensils } from 'lucide-react'
import { useHealthData } from './hooks/useHealthData'
import { WorkoutLogger } from './components/WorkoutLogger'
import { MacroTracker } from './components/MacroTracker'

export default function HealthDashboard() {
  const [tab, setTab] = useState('workouts')
  const { workouts, foodLogs, loading, addWorkout, addFoodLog, deleteWorkout, deleteFoodLog } = useHealthData()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{fontFamily:'Space Grotesk'}}>Health</h1>
        <p className="text-sm text-muted-foreground">Track workouts, nutrition & body metrics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-xl p-1">
        {[
          { id: 'workouts', label: 'Workouts', icon: Dumbbell },
          { id: 'nutrition', label: 'Nutrition', icon: Utensils },
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
          {tab === 'workouts' && (
            <WorkoutLogger workouts={workouts} onAdd={addWorkout} onDelete={deleteWorkout} />
          )}
          {tab === 'nutrition' && (
            <MacroTracker foodLogs={foodLogs} onAdd={addFoodLog} onDelete={deleteFoodLog} />
          )}
        </>
      )}
    </div>
  )
}