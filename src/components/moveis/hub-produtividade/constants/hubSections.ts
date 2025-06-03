
import { 
  Activity,
  CheckSquare, 
  FileText, 
  List, 
  BarChart3,
  Users
} from 'lucide-react';
import { HubSection } from '../types/hubTypes';

export const HUB_SECTIONS: HubSection[] = [
  {
    id: 'dashboard',
    title: 'Hub de Produtividade',
    icon: BarChart3,
    description: 'Visão geral da produtividade'
  },
  {
    id: 'rotinas',
    title: 'Rotinas',
    icon: CheckSquare,
    description: 'Rotinas obrigatórias e tarefas'
  },
  {
    id: 'orientacoes',
    title: 'Informativos e VM',
    icon: FileText,
    description: 'Documentos, orientações e visual merchandising'
  },
  {
    id: 'monitoramento',
    title: 'Monitoramento',
    icon: Users,
    description: 'Monitoramento de visualizações por cargo'
  }
];
