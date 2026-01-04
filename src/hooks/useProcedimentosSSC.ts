import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { ProcedimentoSSC, ProcedimentoInsert, ProcedimentoUpdate } from '@/types/ssc-procedimentos'

export function useProcedimentosSSC() {
  const [procedimentos, setProcedimentos] = useState<ProcedimentoSSC[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProcedimentos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('ssc_procedimentos')
        .select('*')
        .order('fabricante')

      if (fetchError) throw fetchError
      setProcedimentos(data as ProcedimentoSSC[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar procedimentos')
      console.error('Erro ao buscar procedimentos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createProcedimento = useCallback(async (procedimento: ProcedimentoInsert) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: insertError } = await supabase
        .from('ssc_procedimentos')
        .insert(procedimento)
        .select()
        .single()

      if (insertError) throw insertError
      setProcedimentos(prev => [...prev, data as ProcedimentoSSC])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar procedimento')
      console.error('Erro ao criar procedimento:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateProcedimento = useCallback(async (id: string, updates: ProcedimentoUpdate) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: updateError } = await supabase
        .from('ssc_procedimentos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      setProcedimentos(prev => prev.map(p => p.id === id ? data as ProcedimentoSSC : p))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar procedimento')
      console.error('Erro ao atualizar procedimento:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteProcedimento = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const { error: deleteError } = await supabase
        .from('ssc_procedimentos')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      setProcedimentos(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir procedimento')
      console.error('Erro ao excluir procedimento:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    procedimentos,
    loading,
    error,
    fetchProcedimentos,
    createProcedimento,
    updateProcedimento,
    deleteProcedimento,
  }
}
