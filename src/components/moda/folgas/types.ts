export interface Folga {
  id: string;
  consultorId: string;
  data: Date;
  motivo?: string;
  createdAt?: string;
  createdBy?: string;
}

export interface Consultor {
  id: string;
  nome: string;
  avatar?: string;
}
