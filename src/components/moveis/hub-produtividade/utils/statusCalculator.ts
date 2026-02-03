import { Tarefa } from '../types';

export function calculateTarefaStatus(tarefa: Tarefa): 'pendente' | 'concluida' | 'atrasada' {
  if (tarefa.status === 'concluida') {
    return 'concluida';
  }
  
  const hoje = new Date();
  const dataEntrega = new Date(tarefa.data_entrega);
  
  return dataEntrega < hoje ? 'atrasada' : 'pendente';
}
