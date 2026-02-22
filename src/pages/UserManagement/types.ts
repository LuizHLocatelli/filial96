import { User as AppUser, UserRole } from "@/types";

export interface UserWithStats extends AppUser {
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
}

export interface EditUserFormProps {
  user: UserWithStats;
  onSave: (user: UserWithStats) => void;
  onCancel: () => void;
}

export const roleLabels: Record<UserRole, string> = {
  gerente: 'Gerente',
  crediarista: 'Crediarista',
  consultor_moveis: 'Consultor Móveis',
  consultor_moda: 'Consultor Moda',
  jovem_aprendiz: 'Jovem Aprendiz'
};

export const roleColors: Record<UserRole, string> = {
  gerente: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200/50 dark:border-yellow-900/50',
  crediarista: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/50',
  consultor_moveis: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200/50 dark:border-green-900/50',
  consultor_moda: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/50',
  jovem_aprendiz: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200/50 dark:border-orange-900/50'
}; 