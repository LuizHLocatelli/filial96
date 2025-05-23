export type UserRole = 'gerente' | 'crediarista' | 'consultor_moveis' | 'consultor_moda';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  displayName?: string;
}

export type TaskStatus = 'pendente' | 'em_andamento' | 'concluida' | 'cancelada' | 'aguardando_cliente';

export type TaskType = 'entrega' | 'retirada' | 'montagem' | 'garantia' | 'organizacao' | 'cobranca';

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  observation?: string;
  status: TaskStatus;
  assignedTo: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
  priority: 'baixa' | 'media' | 'alta';
  clientName?: string;
  clientPhone?: string;
  clientAddress?: string;
  clientCpf?: string;
  notes?: string;
  products?: string;
  purchaseDate?: string;
  expectedArrivalDate?: string;
  expectedDeliveryDate?: string;
  invoiceNumber?: string;
}
