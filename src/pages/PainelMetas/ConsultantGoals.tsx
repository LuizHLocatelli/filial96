import React from 'react'
import { Consultant, Goal, Team } from './types'
import { calculateIndividualGoals, formatGoalValue } from './utils'
import { User, TrendingUp, Calendar, Zap, Crown } from 'lucide-react'

type Timeframe = 'day' | 'week' | 'month'

interface ConsultantGoalsProps {
  consultants: Consultant[]
  goals: Goal[]
  timeframe: Timeframe
}

interface IndividualGoals {
  daily: number
  weekly: number
  monthly: number
}

const ConsultantGoals: React.FC<ConsultantGoalsProps> = ({
  consultants,
  goals,
}) => {
  const getGoalsForTeam = (team: Team): IndividualGoals => {
    const teamConsultants = consultants.filter(c => c.team === team)
    const teamTotalGoal = goals
      .filter(g => g.team === team && g.goalType === 'value')
      .reduce((acc, g) => acc + g.monthlyGoal, 0)
    return calculateIndividualGoals(teamTotalGoal, teamConsultants.length)
  }

  const moveisGoals = getGoalsForTeam('Móveis')
  const modaGoals = getGoalsForTeam('Moda')

  const renderConsultantList = (
    title: string,
    team: Team,
    individualGoals: IndividualGoals,
  ) => {
    const teamConsultants = consultants.filter(c => c.team === team)
    if (teamConsultants.length === 0) return null

    return (
      <div className="mb-12">
        <h4 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">
          {title}
        </h4>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {teamConsultants.map((consultant, index) => (
            <div
              key={consultant.id}
              className="transform rounded-2xl border border-border bg-card p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:border-primary hover:shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-green-100/10 p-3">
                    <User className="h-6 w-6 text-green-500" />
                  </div>
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {consultant.name}
                  </h5>
                </div>
                {index === 0 && ( // Just an example of highlighting top performer
                  <Crown className="h-6 w-6 text-yellow-500" />
                )}
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-background p-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-gray-500" />
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      Diária
                    </span>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {formatGoalValue(individualGoals.daily)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-background p-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                      Semanal
                    </span>
                  </div>
                  <span className="font-bold text-gray-800 dark:text-white">
                    {formatGoalValue(individualGoals.weekly)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3 ring-1 ring-primary/50">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="font-medium text-primary">
                      Mensal
                    </span>
                  </div>
                  <span className="font-bold text-primary">
                    {formatGoalValue(individualGoals.monthly)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-16 w-full">
      <h3 className="mb-8 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
        Metas Individuais por Equipe
      </h3>
      {renderConsultantList('Equipe Móveis', 'Móveis', moveisGoals)}
      {renderConsultantList('Equipe Moda', 'Moda', modaGoals)}
    </div>
  )
}

export default ConsultantGoals