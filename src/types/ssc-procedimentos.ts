// Tipos para a tabela ssc_procedimentos

export type ProcedimentoCanal = {
  tipo: string
  valor: string
  horario?: string
}

export type ProcedimentoLink = {
  titulo: string
  url: string
}

export type ProcedimentoContato = {
  nome: string
  tipo: string
  valor: string
}

export type ProcedimentoSSC = {
  id: string
  fabricante: string
  categoria: string
  procedimento: string
  canais: ProcedimentoCanal[]
  observacoes?: string[]
  links_principais?: ProcedimentoLink[]
  contatos_exclusivos?: ProcedimentoContato[]
  created_at: string
  updated_at: string
}

export type ProcedimentoInsert = Omit<ProcedimentoSSC, 'id' | 'created_at' | 'updated_at'>

export type ProcedimentoUpdate = Partial<ProcedimentoInsert>
