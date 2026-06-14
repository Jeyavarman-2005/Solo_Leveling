import { useState, useEffect, useCallback } from 'react'
import supabase from '../../../config/supabase'
import { useAuth } from '../../../context/AuthContext'

export function useTasksData() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [{ data: t }, { data: s }] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('skills').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])
      setTasks(t || [])
      setSkills(s || [])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  const addTask = async (task) => {
    const { data, error } = await supabase.from('tasks').insert({ ...task, user_id: user.id }).select().single()
    if (!error) setTasks(p => [data, ...p])
    return { data, error }
  }

  const updateTask = async (id, updates) => {
    const { data, error } = await supabase.from('tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single()
    if (!error) setTasks(p => p.map(t => t.id === id ? data : t))
    return { data, error }
  }

  const deleteTask = async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) setTasks(p => p.filter(t => t.id !== id))
    return { error }
  }

  const toggleTask = (id) => {
    const task = tasks.find(t => t.id === id)
    if (task) updateTask(id, { completed: !task.completed })
  }

  const addSkill = async (skill) => {
    const { data, error } = await supabase.from('skills').insert({ ...skill, user_id: user.id }).select().single()
    if (!error) setSkills(p => [data, ...p])
    return { data, error }
  }

  const updateSkill = async (id, updates) => {
    const { data, error } = await supabase.from('skills').update(updates).eq('id', id).select().single()
    if (!error) setSkills(p => p.map(s => s.id === id ? data : s))
    return { data, error }
  }

  const deleteSkill = async (id) => {
    const { error } = await supabase.from('skills').delete().eq('id', id)
    if (!error) setSkills(p => p.filter(s => s.id !== id))
    return { error }
  }

  return { tasks, skills, loading, addTask, updateTask, deleteTask, toggleTask, addSkill, updateSkill, deleteSkill, refetch: fetchData }
}