import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, ListChecks } from 'lucide-react';
import { motion } from 'framer-motion';

interface TarefasStats {
  total: number;
  concluidas: number;
  pendentes: number;
  atrasadas: number;
}

interface TarefasHeaderStatsProps {
  stats: TarefasStats;
}

export function TarefasHeaderStats({ stats }: TarefasHeaderStatsProps) {
  const statsCards = [
    {
      label: 'Total',
      value: stats.total,
      icon: ListChecks,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary-200 dark:border-primary-800'
    },
    {
      label: 'Concluídas',
      value: stats.concluidas,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      label: 'Pendentes',
      value: stats.pendentes,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800'
    },
    {
      label: 'Atrasadas',
      value: stats.atrasadas,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-red-200 dark:border-red-800'
    }
  ];

  return (
    <div className="mb-6">
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
          Tarefas
        </h2>
        <p className="text-sm text-muted-foreground">
          Gerencie e acompanhe as tarefas do setor de móveis
        </p>
      </div>
      
      <div className="grid-responsive-stats">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`${stat.bgColor} ${stat.borderColor} border transition-all duration-300 hover:shadow-md`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                        {stat.label}
                      </p>
                      <p className="text-lg sm:text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}