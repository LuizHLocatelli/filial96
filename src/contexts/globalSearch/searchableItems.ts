import { SearchResult } from "./types";

export const searchableItems: SearchResult[] = [
  {
    id: 'hub-produtividade',
    title: 'Hub de Produtividade',
    description: 'Central de ferramentas e produtividade',
    type: 'page',
    path: '/',
    icon: 'Activity'
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
  {
    id: 'hub-produtividade-radio',
    title: 'Rádio - Hub',
    description: 'Ouça sua rádio favorita no Hub',
    type: 'section',
    path: '/?tab=radio',
    section: 'Hub de Produtividade',
    icon: 'Radio'
  },
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
    id: 'moveis-produto-foco',
    title: 'Produto Foco - Móveis',
    description: 'Produtos prioritários do setor de móveis',
    type: 'section',
    path: '/moveis?tab=produto-foco',
    section: 'Móveis',
    icon: 'Star'
  },
  {
    id: 'crediario',
    title: 'Crediário',
    description: 'Gestão completa do setor de crediário',
    type: 'page',
    path: '/crediario',
    icon: 'CreditCard'
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
    id: 'crediario-diretorio',
    title: 'Diretório - Crediário',
    description: 'Arquivos organizados do setor de crediário',
    type: 'section',
    path: '/crediario?tab=diretorio',
    section: 'Crediário',
    icon: 'FolderArchive'
  },
  {
    id: 'cards-promocionais',
    title: 'Cards Promocionais',
    description: 'Gestão de cards promocionais e campanhas',
    type: 'page',
    path: '/cards-promocionais',
    icon: 'Image'
  },
  {
    id: 'perfil',
    title: 'Perfil',
    description: 'Configurações do usuário e perfil',
    type: 'page',
    path: '/perfil',
    icon: 'User'
  },
  {
    id: 'relatorios',
    title: 'Relatórios',
    description: 'Relatórios e listagens do sistema',
    type: 'feature',
    path: '/?tab=relatorios',
    icon: 'BarChart3'
  },
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
];
