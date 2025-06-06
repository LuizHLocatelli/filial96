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
  // Hub de Produtividade (página principal)
  {
    id: 'hub-produtividade',
    title: 'Hub de Produtividade',
    description: 'Central de rotinas, tarefas e orientações',
    type: 'page',
    path: '/',
    icon: 'Activity'
  },
  // Subpáginas do Hub de Produtividade
  {
    id: 'hub-produtividade-dashboard',
    title: 'Dashboard - Hub',
    description: 'Visão geral e métricas do Hub de Produtividade',
    type: 'section',
    path: '/?tab=dashboard',
    section: 'Hub de Produtividade',
    icon: 'Activity'
  },
  {
    id: 'hub-produtividade-rotinas',
    title: 'Rotinas - Hub',
    description: 'Rotinas obrigatórias centralizadas',
    type: 'section',
    path: '/?tab=rotinas',
    section: 'Hub de Produtividade',
    icon: 'CheckSquare'
  },
  {
    id: 'hub-produtividade-orientacoes',
    title: 'Informativos e VM - Hub',
    description: 'Orientações e visual merchandising',
    type: 'section',
    path: '/?tab=orientacoes',
    section: 'Hub de Produtividade',
    icon: 'FileText'
  },
  {
    id: 'hub-produtividade-monitoramento',
    title: 'Monitoramento - Hub',
    description: 'Acompanhamento por cargo no Hub',
    type: 'section',
    path: '/?tab=monitoramento',
    section: 'Hub de Produtividade',
    icon: 'Users'
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
    id: 'moveis-visao-geral',
    title: 'Visão Geral - Móveis',
    description: 'Dashboard e acesso rápido do setor de móveis',
    type: 'section',
    path: '/moveis?tab=overview',
    section: 'Móveis',
    icon: 'Sofa'
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
  
  // Funcionalidades específicas
  {
    id: 'relatorios',
    title: 'Relatórios',
    description: 'Relatórios e listagens do sistema',
    type: 'feature',
    path: '/?tab=relatorios',
    icon: 'BarChart3'
  },
  {
    id: 'orientacoes',
    title: 'Orientações',
    description: 'Documentos de orientação e procedimentos',
    type: 'feature',
    path: '/?tab=orientacoes',
    icon: 'FileText'
  },
  {
    id: 'rotinas',
    title: 'Rotinas',
    description: 'Gestão de rotinas obrigatórias',
    type: 'feature',
    path: '/?tab=rotinas',
    icon: 'CheckSquare'
  },
  {
    id: 'tarefas',
    title: 'Tarefas',
    description: 'Gestão e acompanhamento de tarefas',
    type: 'feature',
    path: '/?tab=orientacoes',
    icon: 'List'
  },
  
  // Moda
  {
    id: 'moda',
    title: 'Moda',
    description: 'Gestão completa do setor de moda',
    type: 'page',
    path: '/moda',
    icon: 'Shirt'
  },
  {
    id: 'moda-visao-geral',
    title: 'Visão Geral - Moda',
    description: 'Dashboard e acesso rápido do setor de moda',
    type: 'section',
    path: '/moda?tab=overview',
    section: 'Moda',
    icon: 'Shirt'
  },
  {
    id: 'moda-diretorio',
    title: 'Diretório - Moda',
    description: 'Arquivos e documentos do setor de moda',
    type: 'section',
    path: '/moda?tab=diretorio',
    section: 'Moda',
    icon: 'FolderArchive'
  },
  {
    id: 'moda-produto-foco',
    title: 'Produto Foco - Moda',
    description: 'Produtos prioritários e metas de vendas',
    type: 'section',
    path: '/moda?tab=produto-foco',
    section: 'Moda',
    icon: 'Star'
  },
  {
    id: 'moda-folgas',
    title: 'Folgas - Moda',
    description: 'Controle de folgas do setor de moda',
    type: 'section',
    path: '/moda?tab=folgas',
    section: 'Moda',
    icon: 'Calendar'
  }
];

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = (term: string) => {
    setSearchTerm(term);
    setIsSearching(true);
    
    // Console log para debug mobile
    console.log('🔍 [MOBILE DEBUG] Pesquisando por:', term);
    console.log('📱 [MOBILE DEBUG] Total de itens pesquisáveis:', searchableItems.length);
    
    if (!term.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      console.log('❌ [MOBILE DEBUG] Termo vazio, limpando resultados');
      return;
    }

    // Simular delay de pesquisa
    setTimeout(() => {
      const searchLower = term.toLowerCase();
      const results = searchableItems.filter(item => {
        const isMatch = (
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          (item.section && item.section.toLowerCase().includes(searchLower))
        );
        
        if (isMatch) {
          console.log('✅ [MOBILE DEBUG] Encontrado:', item.title, '| Tipo:', item.type);
        }
        
        return isMatch;
      });
      
      // Ordenar por relevância - exact matches primeiro
      results.sort((a, b) => {
        const aExact = a.title.toLowerCase() === searchLower ? 1 : 0;
        const bExact = b.title.toLowerCase() === searchLower ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;
        
        const aStartsWith = a.title.toLowerCase().startsWith(searchLower) ? 1 : 0;
        const bStartsWith = b.title.toLowerCase().startsWith(searchLower) ? 1 : 0;
        return bStartsWith - aStartsWith;
      });
      
      console.log(`🎯 [MOBILE DEBUG] Resultados encontrados: ${results.length} de ${searchableItems.length} itens`);
      console.log('📋 [MOBILE DEBUG] Resultados:', results.map(r => r.title));
      
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
