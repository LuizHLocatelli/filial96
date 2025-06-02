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
    title: 'Dashboard',
    icon: BarChart3,
    description: 'Visão geral da produtividade'
  },
  {
    id: 'rotinas',
    title: 'Rotinas',
    icon: CheckSquare,
    description: 'Rotinas obrigatórias'
  },
  {
    id: 'orientacoes',
    title: 'Orientações',
    icon: FileText,
    description: 'Documentos e orientações'
  },
  {
    id: 'monitoramento',
    title: 'Monitoramento',
    icon: Users,
    description: 'Monitoramento de visualizações por cargo'
  },
  {
    id: 'tarefas',
    title: 'Tarefas',
    icon: List,
    description: 'Gestão de tarefas'
  }
];
