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
  gerente: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  crediarista: 'bg-blue-100 text-blue-800 border-blue-300',
  consultor_moveis: 'bg-green-100 text-green-800 border-green-300',
  consultor_moda: 'bg-purple-100 text-purple-800 border-purple-300',
  jovem_aprendiz: 'bg-orange-100 text-orange-800 border-orange-300'
}; 