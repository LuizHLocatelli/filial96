export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatGoalValue = (value: number, type: 'value' | 'quantity' = 'value') => {
  if (type === 'quantity') {
    return value.toString();
  }
  return formatCurrency(value);
};

export const calculateProgress = (current: number, goal: number) => {
  if (goal === 0) return 0;
  return (current / goal) * 100;
};

// Assume 4.33 weeks in a month and 6 working days (Mon-Sat)
const WEEKS_IN_MONTH = 4.33;
const DAYS_IN_WEEK = 6;

export const calculateIndividualGoals = (totalGoal: number, numConsultants: number) => {
  if (numConsultants === 0) {
    return {
      monthly: 0,
      weekly: 0,
      daily: 0,
    };
  }
  
  const monthly = totalGoal / numConsultants;
  const weekly = monthly / WEEKS_IN_MONTH;
  const daily = weekly / DAYS_IN_WEEK;

  return { monthly, weekly, daily };
};

// SIMULAÇÃO: Em um app real, estes dados viriam do backend já filtrados
const DAYS_IN_MONTH = 22; // Dias úteis

export const getGoalForTimeframe = (monthlyGoal: number, timeframe: 'day' | 'week' | 'month') => {
  switch (timeframe) {
    case 'day':
      return monthlyGoal / DAYS_IN_MONTH;
    case 'week':
      return monthlyGoal / WEEKS_IN_MONTH;
    case 'month':
    default:
      return monthlyGoal;
  }
};

export const getValueForTimeframe = (currentMonthlyValue: number, timeframe: 'day' | 'week' | 'month') => {
  // Esta é uma simulação simplificada para demonstração
  switch (timeframe) {
    case 'day':
      return currentMonthlyValue / (new Date().getDate()); // Média até o dia de hoje
    case 'week':
      return currentMonthlyValue / (Math.ceil(new Date().getDate() / 7)); // Média até a semana de hoje
    case 'month':
    default:
      return currentMonthlyValue;
  }
}; 