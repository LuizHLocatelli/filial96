import { Sector, Consultant } from './types';

export const initialSectors: Sector[] = [
  { id: 'eletromoveis', name: 'Eletromóveis', team: 'Móveis', monthlyGoal: 50000, currentValue: 12500, goalType: 'value' },
  { id: 'moda', name: 'Moda', team: 'Moda', monthlyGoal: 30000, currentValue: 15000, goalType: 'value' },
  { id: 'garantia_estendida', name: 'Garantia Estendida', team: 'Móveis', monthlyGoal: 5000, currentValue: 1200, goalType: 'value' },
  { id: 'garantia_avulsa', name: 'Garantia Avulsa', team: 'Móveis', monthlyGoal: 50, currentValue: 15, goalType: 'quantity' },
  { id: 'seguro_rfq', name: 'Seguro RFQ', team: 'Móveis', monthlyGoal: 1500, currentValue: 500, goalType: 'value' },
  { id: 'seguro_moveis', name: 'Seguro Móveis', team: 'Móveis', monthlyGoal: 1000, currentValue: 300, goalType: 'value' },
  { id: 'seguro_moda', name: 'Seguro Moda', team: 'Moda', monthlyGoal: 1000, currentValue: 650, goalType: 'value' },
];

export const consultants: Consultant[] = [
  { id: 1, name: 'Alice', team: 'Móveis' },
  { id: 2, name: 'Beto', team: 'Móveis' },
  { id: 3, name: 'Carla', team: 'Móveis' },
  { id: 4, name: 'Daniela', team: 'Moda' },
  { id: 5, name: 'Eduardo', team: 'Moda' },
  { id: 6, name: 'Fernanda', team: 'Moda' },
]; 