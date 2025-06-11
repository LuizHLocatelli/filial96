import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { AnimatePresence, motion } from 'framer-motion'
import { addMonths, subMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import SectorGoalCard from './SectorGoalCard'
import ConsultantGoals from './ConsultantGoals'
import SetGoalModal from './SetGoalModal'
import { TeamDetailView } from './TeamDetailView'
import { Goal, Consultant, Team } from './types'
import { FaArrowLeft } from 'react-icons/fa'
import {
  getGoalsByMonth,
  getSalesRecords,
  getConsultants,
  upsertGoal,
} from '../../services/supabase/goals'

const standardSectors: Omit<Goal, 'id' | 'currentValue' | 'monthlyGoal'>[] = [
  { sector: 'Eletromóveis', team: 'Móveis', goalType: 'value' },
  { sector: 'Moda', team: 'Moda', goalType: 'value' },
  { sector: 'Garantias', team: 'Ambos', goalType: 'value' },
  { sector: 'Serviços', team: 'Ambos', goalType: 'value' },
  { sector: 'Telefonia', team: 'Ambos', goalType: 'value' },
  { sector: 'Consórcio', team: 'Ambos', goalType: 'value' },
  { sector: 'Seguro Roubo e Furto', team: 'Ambos', goalType: 'value' },
  { sector: 'Garantia Avulsa', team: 'Ambos', goalType: 'quantity' },
]

const PainelMetas: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [goals, setGoals] = useState<Goal[]>([])
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('month')
  const [selectedTeam, setSelectedTeam] = useState<Team | 'Ambos'>('Ambos')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSector, setSelectedSector] = useState<Goal | null>(null)
  const [detailedView, setDetailedView] = useState<Team | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAndProcessGoals()
  }, [currentDate, timeframe])

  const fetchAndProcessGoals = async () => {
    setIsLoading(true)
    try {
      const fetchedGoals = await getGoalsByMonth(currentDate)
      const fetchedConsultants = await getConsultants()

      const goalIds = fetchedGoals.map(g => g.id)
      const salesRecords =
        goalIds.length > 0
          ? await getSalesRecords(goalIds, timeframe, currentDate)
          : []

      // Mescla as metas do DB com os setores padrão
      const allGoals = standardSectors.map(standardSector => {
        const existingGoal = fetchedGoals.find(
          g => g.sector === standardSector.sector,
        )
        if (existingGoal) {
          const relevantSales = salesRecords.filter(
            sr => sr.goal_id === existingGoal.id,
          )
          const currentValue = relevantSales.reduce(
            (acc, cur) => acc + cur.value,
            0,
          )
          return { ...existingGoal, currentValue }
        }
        // Se não existir, cria uma meta local temporária
        return {
          ...standardSector,
          id: uuidv4(), // Gera um ID único para a nova meta potencial
          monthlyGoal: 0,
          currentValue: 0,
        }
      })

      const consultantsWithSales = fetchedConsultants.map(consultant => {
        const sales = salesRecords.filter(
          sr => sr.consultant_id === consultant.id,
        )
        return { ...consultant, sales }
      })

      setGoals(allGoals)
      setConsultants(consultantsWithSales)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      setCurrentDate(newDate)
    }
  }
  
  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentDate(current => (direction === 'prev' ? subMonths(current, 1) : addMonths(current, 1)));
  };


  const handleTimeframeChange = (newTimeframe: 'day' | 'week' | 'month') => {
    setTimeframe(newTimeframe)
  }

  const handleTeamChange = (newTeam: Team | 'Ambos') => {
    setSelectedTeam(newTeam)
  }

  const handleSetGoal = (sector: Goal) => {
    setSelectedSector(sector)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSector(null)
  }

  const handleSaveGoal = async (newGoalValue: number) => {
    if (selectedSector) {
      const goalToUpdate = {
        ...selectedSector,
        monthlyGoal: newGoalValue,
        month: currentDate,
      }

      try {
        await upsertGoal(goalToUpdate)
        handleCloseModal()
        fetchAndProcessGoals() 
      } catch (error) {
        console.error('Failed to save goal:', error)
      }
    }
  }

  const filteredGoals = goals.filter(
    goal =>
      selectedTeam === 'Ambos' || goal.team === selectedTeam || goal.team === 'Ambos',
  )

  const totalGoal = filteredGoals
    .filter(goal => goal.goalType === 'value')
    .reduce((acc, goal) => acc + goal.monthlyGoal, 0)
  const totalValue = filteredGoals
    .filter(goal => goal.goalType === 'value')
    .reduce((acc, goal) => acc + goal.currentValue, 0)

  const getConsultantsByTeam = (team: Team): Consultant[] => {
    return consultants.filter(c => c.team === team)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
          Carregando dados...
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 text-gray-800 transition-colors duration-300 dark:bg-gray-900 dark:text-gray-200">
      <AnimatePresence>
        {detailedView && detailedView !== 'Ambos' && detailedView !== 'Geral' ? (
          <TeamDetailView
            team={detailedView}
            consultants={getConsultantsByTeam(detailedView)}
            goals={goals}
            onBack={() => setDetailedView(null)}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full p-4"
          >
            {/* Header */}
            <header className="sticky top-0 z-40 mb-6 flex flex-col items-center justify-between gap-4 rounded-xl border-b border-border bg-card p-4 md:flex-row">
              <div className="flex w-full items-center justify-between md:w-auto">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 rounded-lg bg-background px-4 py-2 text-foreground/80 transition-colors hover:bg-border"
                >
                  <FaArrowLeft />
                  Voltar
                </button>
                <h1 className="text-2xl font-bold text-foreground md:hidden">
                  Painel de Metas
                </h1>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-foreground">
                  <button
                    onClick={() => handleMonthChange('prev')}
                    className="rounded-full p-2 transition-colors hover:bg-border"
                  >
                    &lt;
                  </button>
                  <h2 className="w-40 text-center text-xl font-bold capitalize">
                    {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                  </h2>
                  <button
                    onClick={() => handleMonthChange('next')}
                    className="rounded-full p-2 transition-colors hover:bg-border"
                  >
                    &gt;
                  </button>
                </div>
                <div className="flex gap-2">
                  {[
                    { label: 'Móveis', value: 'Móveis' },
                    { label: 'Moda', value: 'Moda' },
                    { label: 'Ambos', value: 'Ambos' },
                  ].map(team => (
                    <button
                      key={team.value}
                      onClick={() =>
                        handleTeamChange(team.value as Team | 'Ambos')
                      }
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                        selectedTeam === team.value
                          ? 'border-transparent bg-primary text-primary-foreground shadow-md'
                          : 'border-border bg-background text-foreground/70 hover:bg-border'
                      }`}
                    >
                      {team.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="hidden md:block">
                {/* Placeholder for other actions */}
              </div>
            </header>
            <h1 className="mb-6 hidden text-3xl font-bold text-gray-900 dark:text-white md:block">
              Painel de Metas
            </h1>

            {/* Grid de Metas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredGoals.map(goal => (
                <SectorGoalCard
                  key={goal.id}
                  sector={goal}
                  onSetGoal={() => handleSetGoal(goal)}
                  onDrillDown={
                    goal.team === 'Móveis' || goal.team === 'Moda'
                      ? () => setDetailedView(goal.team)
                      : undefined
                  }
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isModalOpen && selectedSector && (
        <SetGoalModal
          sector={selectedSector}
          onClose={handleCloseModal}
          onSave={handleSaveGoal}
        />
      )}
    </div>
  )
}

export default PainelMetas 