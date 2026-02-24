/**
 * Tipos compartilhados para o módulo de Folgas
 * Usados por todos os módulos: crediario, moda, moveis
 */

export interface Consultor {
  id: string;
  nome: string;
  avatar?: string;
}

export interface Folga {
  id: string;
  data: Date;
  consultorId: string;
  motivo?: string;
  createdAt?: string;
  createdBy?: string;
}

export interface FolgaFormValues {
  data: Date;
  consultorId: string;
  motivo?: string;
}

export interface FolgaStatistics {
  totalFolgasNoMes: number;
  proximasFolgas: number;
  consultoresComFolga: number;
  totalConsultores: number;
}

export interface UseFolgasConfig {
  /** Nome da tabela no Supabase (atualmente apenas 'moveis_folgas') */
  tableName: string;
  /** Role dos consultores (ex: 'consultor_moveis') */
  consultantRole: string;
  /** Título do módulo para exibir no UI */
  moduleTitle: string;
  /** Descrição do módulo */
  moduleDescription: string;
}

export interface UseFolgasReturn {
  currentMonth: Date;
  consultores: Consultor[];
  isLoadingConsultores: boolean;
  folgas: Folga[];
  isLoadingFolgas: boolean;
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedConsultor: string;
  setSelectedConsultor: (id: string) => void;
  motivo: string;
  setMotivo: (motivo: string) => void;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  handleAddFolga: () => Promise<void>;
  handleDeleteFolga: (folgaId: string) => Promise<void>;
  getConsultorById: (id: string) => Consultor | undefined;
  getUserNameById: (userId: string) => string | undefined;
  folgasDoDiaSelecionado: Folga[];
  handleDateClick: (date: Date) => void;
  allUsers: Array<{ id: string; name: string }>;
  isLoadingUsers: boolean;
  getWeeks: () => Date[][];
  refetchFolgas: () => Promise<void>;
}
