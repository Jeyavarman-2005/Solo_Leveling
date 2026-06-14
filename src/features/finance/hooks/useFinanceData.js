import { useState, useEffect, useCallback } from 'react'
import supabase from '../../../config/supabase'
import { useAuth } from '../../../context/AuthContext'

export function useFinanceData() {
  const { user } = useAuth()
  const [portfolio, setPortfolio] = useState([])
  const [expenses, setExpenses] = useState([])
  const [savings, setSavings] = useState([])
  const [sipEntries, setSipEntries] = useState([])
  const [optionsTrades, setOptionsTrades] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [{ data: p }, { data: e }, { data: s }, { data: sip }, { data: ot }] = await Promise.all([
        supabase.from('portfolio').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(100),
        supabase.from('savings_goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('sip_entries').select('*').eq('user_id', user.id).order('investment_date', { ascending: false }).limit(50),
        supabase.from('options_trades').select('*').eq('user_id', user.id).order('trade_date', { ascending: false }).limit(50),
      ])
      setPortfolio(p || [])
      setExpenses(e || [])
      setSavings(s || [])
      setSipEntries(sip || [])
      setOptionsTrades(ot || [])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  const addPortfolioItem = async (item) => {
    const { data, error } = await supabase.from('portfolio').insert({ ...item, user_id: user.id }).select().single()
    if (!error) setPortfolio(p => [data, ...p])
    return { data, error }
  }

  const updatePortfolioItem = async (id, updates) => {
    const { data, error } = await supabase.from('portfolio').update(updates).eq('id', id).select().single()
    if (!error) setPortfolio(p => p.map(i => i.id === id ? data : i))
    return { data, error }
  }

  const deletePortfolioItem = async (id) => {
    const { error } = await supabase.from('portfolio').delete().eq('id', id)
    if (!error) setPortfolio(p => p.filter(i => i.id !== id))
    return { error }
  }

  const addExpense = async (expense) => {
    const { data, error } = await supabase.from('expenses').insert({ ...expense, user_id: user.id }).select().single()
    if (!error) setExpenses(p => [data, ...p])
    return { data, error }
  }

  const deleteExpense = async (id) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (!error) setExpenses(p => p.filter(e => e.id !== id))
    return { error }
  }

  const addSavingsGoal = async (goal) => {
    const { data, error } = await supabase.from('savings_goals').insert({ ...goal, user_id: user.id }).select().single()
    if (!error) setSavings(p => [data, ...p])
    return { data, error }
  }

  const updateSavingsGoal = async (id, updates) => {
    const { data, error } = await supabase.from('savings_goals').update(updates).eq('id', id).select().single()
    if (!error) setSavings(p => p.map(i => i.id === id ? data : i))
    return { data, error }
  }

  const deleteSavingsGoal = async (id) => {
    const { error } = await supabase.from('savings_goals').delete().eq('id', id)
    if (!error) setSavings(p => p.filter(i => i.id !== id))
    return { error }
  }

  const addSipEntry = async (entry) => {
    const { data, error } = await supabase.from('sip_entries').insert({ ...entry, user_id: user.id }).select().single()
    if (!error) setSipEntries(p => [data, ...p])
    return { data, error }
  }

  const addOptionsTrade = async (trade) => {
    const { data, error } = await supabase.from('options_trades').insert({ ...trade, user_id: user.id }).select().single()
    if (!error) setOptionsTrades(p => [data, ...p])
    return { data, error }
  }

  const updateOptionsTrade = async (id, updates) => {
    const { data, error } = await supabase.from('options_trades').update(updates).eq('id', id).select().single()
    if (!error) setOptionsTrades(p => p.map(i => i.id === id ? data : i))
    return { data, error }
  }

  return {
    portfolio, expenses, savings, sipEntries, optionsTrades, loading,
    addPortfolioItem, updatePortfolioItem, deletePortfolioItem,
    addExpense, deleteExpense,
    addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
    addSipEntry, addOptionsTrade, updateOptionsTrade,
    refetch: fetchData,
  }
}