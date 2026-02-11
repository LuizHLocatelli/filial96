/**
 * Types for Currículos feature
 */

export type JobPosition = 'crediarista' | 'consultora_moda' | 'consultor_moveis' | 'jovem_aprendiz';

export interface Curriculo {
  id: string;
  candidate_name: string;
  job_position: JobPosition[];
  file_url: string;
  file_type: 'pdf' | 'image';
  file_size?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CurriculoFormData {
  candidate_name: string;
  job_position: JobPosition[];
  file: File;
}

export const jobPositionLabels: Record<JobPosition, string> = {
  crediarista: 'Crediarista',
  consultora_moda: 'Consultora de Moda',
  consultor_moveis: 'Consultor de Móveis',
  jovem_aprendiz: 'Jovem Aprendiz'
};

export const jobPositionColors: Record<JobPosition, string> = {
  crediarista: 'bg-blue-100 text-blue-800 border-blue-300',
  consultora_moda: 'bg-purple-100 text-purple-800 border-purple-300',
  consultor_moveis: 'bg-green-100 text-green-800 border-green-300',
  jovem_aprendiz: 'bg-orange-100 text-orange-800 border-orange-300'
};
