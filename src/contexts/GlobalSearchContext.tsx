import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'page' | 'section' | 'file' | 'feature';
  path: string;
  section?: string;
  icon?: string;
}

interface GlobalSearchContextType {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: SearchResult[];
  isSearching: boolean;
  performSearch: (term: string) => void;
  clearSearch: () => void;
}

const GlobalSearchContext = createContext<GlobalSearchContextType | undefined>(undefined);

// Dados de pesquisa estáticos para as páginas e funcionalidades do sistema
const searchableItems: SearchResult[] = [
  // Dashboard
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Visão geral do sistema e estatísticas',
    type: 'page',
    path: '/',
    icon: 'LayoutDashboard'
  },
  {
    id: 'dashboard-overview',
    title: 'Visão Geral - Dashboard',
    description: 'Estatísticas e métricas principais do sistema',
    type: 'section',
    path: '/',
    section: 'Dashboard',
    icon: 'Activity'
  },
  {
    id: 'dashboard-actions',
    title: 'Ações Rápidas - Dashboard',
    description: 'Acesso rápido às principais funcionalidades',
    type: 'section',
    path: '/',
    section: 'Dashboard',
    icon: 'Zap'
  },
  {
    id: 'dashboard-recent',
    title: 'Atividade Recente - Dashboard',
    description: 'Histórico de ações e atividades recentes',
    type: 'section',
    path: '/',
    section: 'Dashboard',
    icon: 'Clock'
  },
  
  // Móveis
  {
    id: 'moveis',
    title: 'Móveis',
    description: 'Gestão completa do setor de móveis',
    type: 'page',
    path: '/moveis',
    icon: 'Sofa'
  },
  {
    id: 'moveis-hub-produtividade',
    title: 'Hub de Produtividade - Móveis',
    description: 'Rotinas, orientações e tarefas centralizadas',
    type: 'section',
    path: '/moveis?tab=hub-produtividade',
    section: 'Móveis',
    icon: 'Activity'
  },
  {
    id: 'moveis-diretorio',
    title: 'Diretório - Móveis',
    description: 'Arquivos organizados do setor de móveis',
    type: 'section',
    path: '/moveis?tab=diretorio',
    section: 'Móveis',
    icon: 'FolderArchive'
  },
  {
    id: 'moveis-vendao',
    title: 'Venda O - Móveis',
    description: 'Vendas de outras filiais para móveis',
    type: 'section',
    path: '/moveis?tab=vendao',
    section: 'Móveis',
    icon: 'ShoppingCart'
  },
  {
    id: 'moveis-produto-foco',
    title: 'Produto Foco - Móveis',
    description: 'Produtos prioritários do setor de móveis',
    type: 'section',
    path: '/moveis?tab=produto-foco',
    section: 'Móveis',
    icon: 'Star'
  },
  {
    id: 'moveis-folgas',
    title: 'Folgas - Móveis',
    description: 'Controle de folgas dos consultores de móveis',
    type: 'section',
    path: '/moveis?tab=folgas',
    section: 'Móveis',
    icon: 'Calendar'
  },
  
  // Crediário
  {
    id: 'crediario',
    title: 'Crediário',
    description: 'Gestão completa do setor de crediário',
    type: 'page',
    path: '/crediario',
    icon: 'CreditCard'
  },
  {
    id: 'crediario-listagens',
    title: 'Listagens - Crediário',
    description: 'Relatórios e listagens do crediário',
    type: 'section',
    path: '/crediario?tab=listagens',
    section: 'Crediário',
    icon: 'FileText'
  },
  {
    id: 'crediario-clientes',
    title: 'Clientes - Crediário',
    description: 'Gestão de clientes do crediário',
    type: 'section',
    path: '/crediario?tab=clientes',
    section: 'Crediário',
    icon: 'Users'
  },
  {
    id: 'crediario-depositos',
    title: 'Depósitos - Crediário',
    description: 'Controle de depósitos do crediário',
    type: 'section',
    path: '/crediario?tab=depositos',
    section: 'Crediário',
    icon: 'Calendar'
  },
  {
    id: 'crediario-folgas',
    title: 'Folgas - Crediário',
    description: 'Controle de folgas dos crediaristas',
    type: 'section',
    path: '/crediario?tab=folgas',
    section: 'Crediário',
    icon: 'Coffee'
  },
  {
    id: 'crediario-diretorio',
    title: 'Diretório - Crediário',
    description: 'Arquivos organizados do setor de crediário',
    type: 'section',
    path: '/crediario?tab=diretorio',
    section: 'Crediário',
    icon: 'FolderArchive'
  },
  
  // Cards Promocionais
  {
    id: 'cards-promocionais',
    title: 'Cards Promocionais',
    description: 'Gestão de cards promocionais e campanhas',
    type: 'page',
    path: '/cards-promocionais',
    icon: 'Image'
  },
  
  // Perfil
  {
    id: 'perfil',
    title: 'Perfil',
    description: 'Configurações do usuário e perfil',
    type: 'page',
    path: '/perfil',
    icon: 'User'
  },
  {
    id: 'perfil-info',
    title: 'Informações Pessoais - Perfil',
    description: 'Dados pessoais e informações do usuário',
    type: 'section',
    path: '/perfil',
    section: 'Perfil',
    icon: 'User'
  },
  {
    id: 'perfil-security',
    title: 'Segurança - Perfil',
    description: 'Configurações de senha e segurança da conta',
    type: 'section',
    path: '/perfil',
    section: 'Perfil',
    icon: 'Shield'
  },
  
  // Funcionalidades específicas adicionais
  {
    id: 'relatorios',
    title: 'Relatórios',
    description: 'Relatórios e listagens do sistema',
    type: 'feature',
    path: '/crediario?tab=listagens',
    icon: 'BarChart3'
  },
  {
    id: 'arquivos',
    title: 'Arquivos',
    description: 'Gerenciamento de arquivos e documentos',
    type: 'feature',
    path: '/moveis?tab=diretorio',
    icon: 'FolderArchive'
  },
  {
    id: 'vendas',
    title: 'Vendas',
    description: 'Gestão de vendas e operações comerciais',
    type: 'feature',
    path: '/moveis?tab=vendao',
    icon: 'ShoppingCart'
  },
  {
    id: 'hub-produtividade',
    title: 'Hub de Produtividade',
    description: 'Central de rotinas, orientações e tarefas',
    type: 'feature',
    path: '/moveis?tab=hub-produtividade',
    icon: 'Activity'
  },
  {
    id: 'orientacoes',
    title: 'Orientações',
    description: 'Documentos de orientação e procedimentos',
    type: 'feature',
    path: '/moveis?tab=hub-produtividade',
    icon: 'FileText'
  },
  {
    id: 'rotinas',
    title: 'Rotinas',
    description: 'Gestão de rotinas obrigatórias',
    type: 'feature',
    path: '/moveis?tab=hub-produtividade',
    icon: 'CheckSquare'
  },
  {
    id: 'tarefas',
    title: 'Tarefas',
    description: 'Gestão e acompanhamento de tarefas',
    type: 'feature',
    path: '/moveis?tab=hub-produtividade',
    icon: 'List'
  },
  {
    id: 'gestao-pessoas',
    title: 'Gestão de Pessoas',
    description: 'Controle de folgas e gestão de equipe',
    type: 'feature',
    path: '/moveis?tab=folgas',
    icon: 'Users'
  }
];

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = (term: string) => {
    setSearchTerm(term);
    setIsSearching(true);
    
    if (!term.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Simular delay de pesquisa
    setTimeout(() => {
      const results = searchableItems.filter(item => {
        const searchLower = term.toLowerCase();
        return (
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          (item.section && item.section.toLowerCase().includes(searchLower))
        );
      });
      
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setIsSearching(false);
  };

  return (
    <GlobalSearchContext.Provider
      value={{
        searchTerm,
        setSearchTerm,
        searchResults,
        isSearching,
        performSearch,
        clearSearch
      }}
    >
      {children}
    </GlobalSearchContext.Provider>
  );
}

export function useGlobalSearch() {
  const context = useContext(GlobalSearchContext);
  if (context === undefined) {
    throw new Error('useGlobalSearch must be used within a GlobalSearchProvider');
  }
  return context;
} 