import { supabase } from '../../integrations/supabase/client'
import { Goal, SalesRecord, Consultant, Team } from '../../pages/PainelMetas/types'

// Tipos auxiliares para consistência
type Timeframe = 'day' | 'week' | 'month'

/**
 * Busca as metas de um mês específico.
 * @param date - A data para determinar o mês e o ano.
 * @returns Uma lista de metas.
 */
export const getGoalsByMonth = async (date: Date): Promise<Goal[]> => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('month', `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`)

  if (error) {
    console.error('Error fetching goals:', error)
    throw error
  }

  // Mapeia os dados do Supabase para o tipo Goal do frontend
  return data.map((goal: any) => ({
    id: goal.id,
    sector: goal.sector_name,
    team: goal.team,
    monthlyGoal: goal.monthly_goal,
    currentValue: 0, // Será calculado separadamente
    goalType: goal.goal_type,
  }))
}

/**
 * Busca os registros de vendas para um conjunto de metas e um período.
 * @param goalIds - IDs das metas a serem consideradas.
 * @param timeframe - O período ('day', 'week', 'month').
 * @param date - A data de referência.
 * @returns Uma lista de registros de vendas.
 */
export const getSalesRecords = async (
  goalIds: string[],
  timeframe: Timeframe,
  date: Date
): Promise<SalesRecord[]> => {
  let startDate: string | undefined
  let endDate: string | undefined

  if (timeframe === 'day') {
    startDate = date.toISOString().split('T')[0]
    endDate = startDate
  } else if (timeframe === 'week') {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    startDate = startOfWeek.toISOString().split('T')[0]

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endDate = endOfWeek.toISOString().split('T')[0]
  } else {
    // month
    startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
    endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]
  }
  
  const query = supabase
    .from('sales_records')
    .select('*')
    .in('goal_id', goalIds)

  if (startDate) {
    query.gte('created_at', `${startDate}T00:00:00.000Z`)
  }
  if (endDate) {
    query.lte('created_at', `${endDate}T23:59:59.999Z`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching sales records:', error)
    throw error
  }
  return data
}


/**
 * Busca todos os consultores.
 * @returns Uma lista de consultores.
 */
export const getConsultants = async (): Promise<Consultant[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role')
      .in('role', ['consultor_moveis', 'consultor_moda']);
  
    if (error) {
      console.error('Error fetching consultants:', error);
      throw error;
    }
  
    return data.map((profile: any) => ({
      id: profile.id,
      name: profile.name,
      team: profile.role === 'consultor_moveis' ? 'Móveis' : 'Moda',
      sales: [], // Será preenchido depois
    }));
  };

/**
 * Cria ou atualiza uma meta.
 * @param goal - O objeto da meta a ser salvo.
 */
export const upsertGoal = async (goal: Omit<Goal, 'currentValue' | 'id'> & { id?: string, month: Date }): Promise<any> => {
    const goalData = {
        id: goal.id,
        sector_name: goal.sector,
        team: goal.team,
        monthly_goal: goal.monthlyGoal,
        goal_type: goal.goalType,
        month: `${goal.month.getFullYear()}-${String(goal.month.getMonth() + 1).padStart(2, '0')}-01`,
      };

    const { data, error } = await supabase.from('goals').upsert(goalData, { onConflict: 'id' });
  
    if (error) {
      console.error('Error upserting goal:', error);
      throw error;
    }
  
    return data;
  };
