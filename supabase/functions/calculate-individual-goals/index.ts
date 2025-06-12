import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const CATEGORY_ROLE_MAPPING = {
  'Eletromóveis': ['consultor_moveis'],
  'Moda': ['consultor_moda'],
  'Garantia Estendida': ['consultor_moveis'],
  'RFQ': ['consultor_moveis'],
  'Seguro Móveis': ['consultor_moveis'],
  'Seguro Moda': ['consultor_moda'],
  'Empréstimo Pessoal': ['crediarista'],
}

serve(async (req) => {
  try {
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!serviceRoleKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.")
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey,
      { global: { headers: { Authorization: `Bearer ${serviceRoleKey}` } } }
    )

    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)

    const { data: monthlyGoals, error: monthlyGoalsError } = await supabase
      .from('metas_mensais')
      .select(`
        *,
        metas_categorias (
          nome
        )
      `)
      .eq('mes_ano', firstDayOfMonth)

    if (monthlyGoalsError) {
      throw monthlyGoalsError
    }

    for (const goal of monthlyGoals) {
      const categoryName = goal.metas_categorias.nome

      // Ignorar a categoria 'Geral'
      if (categoryName === 'Geral') {
        console.log("Skipping 'Geral' category as per business rules.")
        continue
      }
      
      const roles = CATEGORY_ROLE_MAPPING[categoryName]

      if (!roles || roles.length === 0) {
        console.warn(`No role mapping or empty roles for category: ${categoryName}`)
        continue
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .in('role', roles)

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        throw profilesError
      }

      if (profiles && profiles.length > 0) {
        const individualGoal = goal.valor_meta / profiles.length

        for (const profile of profiles) {
          const { data, error: upsertError } = await supabase
            .from('metas_funcionarios')
            .upsert({
              funcionario_id: profile.id,
              categoria_id: goal.categoria_id,
              mes_ano: firstDayOfMonth,
              valor_meta: individualGoal,
            }, {
              onConflict: 'funcionario_id,categoria_id,mes_ano'
            })
            .select()

          if (upsertError) {
            console.error('Error upserting goal:', upsertError)
            throw upsertError
          }
        }
      } else {
        console.log(`No profiles found for roles: ${roles.join(', ')} (Category: ${categoryName})`)
      }
    }

    return new Response(JSON.stringify({ message: 'Individual goals updated successfully.' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Critical error in function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}) 