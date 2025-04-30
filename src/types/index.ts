
export type UserRole = 'gerente' | 'vendedor' | 'crediarista';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export type TaskStatus = 'pendente' | 'em_andamento' | 'concluida' | 'cancelada' | 'aguardando_cliente';

export type TaskType = 'entrega' | 'retirada' | 'montagem' | 'garantia' | 'organizacao' | 'cobranca';

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
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
  observation?: string;
}

export interface DashboardSummary {
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  tasksByType: {
    [key in TaskType]: number;
  };
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  taskId: string;
  taskType: TaskType;
  taskTitle: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: string;
}
