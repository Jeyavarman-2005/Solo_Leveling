import { useState, useEffect, useCallback } from 'react'
import supabase from '../../../config/supabase'
import { useAuth } from '../../../context/AuthContext'

export function useHealthData() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState([])
  const [foodLogs, setFoodLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [{ data: w }, { data: f }] = await Promise.all([
        supabase.from('workouts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('food_logs').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }).limit(100),
      ])
      setWorkouts(w || [])
      setFoodLogs(f || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  const addWorkout = async (workout) => {
    const { data, error } = await supabase
      .from('workouts')
      .insert({ ...workout, user_id: user.id })
      .select()
      .single()
    if (!error) setWorkouts(p => [data, ...p])
    return { data, error }
  }

  const addFoodLog = async (log) => {
    const { data, error } = await supabase
      .from('food_logs')
      .insert({ ...log, user_id: user.id })
      .select()
      .single()
    if (!error) setFoodLogs(p => [data, ...p])
    return { data, error }
  }

  const deleteWorkout = async (id) => {
    const { error } = await supabase.from('workouts').delete().eq('id', id)
    if (!error) setWorkouts(p => p.filter(w => w.id !== id))
    return { error }
  }

  const deleteFoodLog = async (id) => {
    const { error } = await supabase.from('food_logs').delete().eq('id', id)
    if (!error) setFoodLogs(p => p.filter(f => f.id !== id))
    return { error }
  }

  return { workouts, foodLogs, loading, error, addWorkout, addFoodLog, deleteWorkout, deleteFoodLog, refetch: fetchData }
}