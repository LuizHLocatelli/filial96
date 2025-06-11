export type Team = 'Móveis' | 'Moda' | 'Ambos' | 'Geral';

export interface Consultant {
  id: string;
  name: string;
  team: Team;
  sales?: SalesRecord[];
}

export interface Goal {
  id: string;
  sector: string;
  team: Team;
  monthlyGoal: number;
  currentValue: number;
  goalType: 'value' | 'quantity';
}

export interface SalesRecord {
    id: string;
    consultant_id: string;
    goal_id: string;
    value: number;
    created_at: string;
} 