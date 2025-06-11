import React from 'react';
import { motion } from 'framer-motion';
import { Goal, Consultant } from './types';
import { ArrowLeft, User } from 'lucide-react';
import { calculateProgress, formatGoalValue } from './utils';

interface TeamDetailViewProps {
  team: 'Móveis' | 'Moda';
  goals: Goal[];
  consultants: Consultant[];
  onBack: () => void;
}

const ConsultantPerformanceCard: React.FC<{
  consultant: Consultant
  goals: Goal[]
  teamConsultants: Consultant[]
}> = ({ consultant, goals, teamConsultants }) => {
  return (
    <motion.div
      className="flex flex-col rounded-xl bg-white p-5 shadow-lg dark:bg-gray-800"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-4 flex items-center space-x-3">
        <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
          <User className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          {consultant.name}
        </h3>
      </div>
      <div className="space-y-4">
        {goals.map(goal => {
          // Calcula o valor alcançado pelo consultor para esta meta específica
          const achievedValue =
            consultant.sales
              ?.filter(sale => sale.goal_id === goal.id)
              .reduce((acc, cur) => acc + cur.value, 0) || 0

          // A meta individual é a meta do setor dividida pelo número de consultores na equipe
          const numConsultantsInTeam = teamConsultants.length || 1
          const individualGoal = goal.monthlyGoal / numConsultantsInTeam

          const progress = calculateProgress(achievedValue, individualGoal)

          const getProgressColor = () => {
            if (progress < 40) return 'bg-red-500'
            if (progress < 70) return 'bg-yellow-500'
            return 'bg-green-500'
          }

          return (
            <div key={goal.id}>
              <div className="mb-1 flex items-end justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {goal.sector}
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {formatGoalValue(achievedValue, goal.goalType)} /{' '}
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatGoalValue(individualGoal, goal.goalType)}
                  </span>
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-2.5 rounded-full ${getProgressColor()}`}
                  style={{ width: `${progress > 100 ? 100 : progress}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  );
}

export const TeamDetailView: React.FC<TeamDetailViewProps> = ({
  team,
  goals,
  consultants,
  onBack,
}) => {
  const teamGoals = goals.filter(g => g.team === team || g.team === 'Ambos')
  const teamConsultants = consultants.filter(c => c.team === team)

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-white">
              Desempenho da Equipe {team}
            </h1>
          </div>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            <ArrowLeft size={16} />
            <span>Voltar ao Painel</span>
          </button>
        </div>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Análise detalhada das metas por consultor.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {teamConsultants.map(consultant => (
          <ConsultantPerformanceCard
            key={consultant.id}
            consultant={consultant}
            goals={teamGoals}
            teamConsultants={teamConsultants}
          />
        ))}
      </div>
    </motion.div>
  );
}; 