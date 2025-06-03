// Dados de exemplo para a seção Moda
// Este arquivo simula dados que viriam do banco de dados

export const modaSampleData = {
  arquivos: [
    {
      id: '1',
      nome: 'Catálogo Verão 2024.pdf',
      tipo: 'application/pdf',
      tamanho: 2048576,
      categoria: 'catalogos',
      criado_em: '2024-01-15T10:30:00Z',
      criado_por: 'user1'
    },
    {
      id: '2',
      nome: 'Lookbook Inverno.jpg',
      tipo: 'image/jpeg',
      tamanho: 1024768,
      categoria: 'lookbooks',
      criado_em: '2024-01-14T14:20:00Z',
      criado_por: 'user1'
    },
    {
      id: '3',
      nome: 'Fichas Técnicas Blusas.xlsx',
      tipo: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      tamanho: 512384,
      categoria: 'fichas-tecnicas',
      criado_em: '2024-01-13T09:15:00Z',
      criado_por: 'user1'
    }
  ],

  produtosFoco: [
    {
      id: '1',
      produto: 'Blusa Estampada Tropical',
      meta_vendas: 50,
      vendas_atual: 32,
      prioridade: 1,
      ativo: true,
      criado_em: '2024-01-10T08:00:00Z'
    },
    {
      id: '2',
      produto: 'Calça Jeans Skinny',
      meta_vendas: 75,
      vendas_atual: 41,
      prioridade: 2,
      ativo: true,
      criado_em: '2024-01-09T10:30:00Z'
    },
    {
      id: '3',
      produto: 'Vestido Midi Floral',
      meta_vendas: 30,
      vendas_atual: 28,
      prioridade: 1,
      ativo: true,
      criado_em: '2024-01-08T15:45:00Z'
    }
  ],

  folgas: [
    {
      id: '1',
      funcionario: 'Maria Silva',
      data_inicio: '2024-01-20',
      data_fim: '2024-01-22',
      tipo: 'folga',
      status: 'aprovada',
      criado_em: '2024-01-15T14:00:00Z'
    },
    {
      id: '2',
      funcionario: 'João Santos',
      data_inicio: '2024-01-25',
      data_fim: '2024-01-25',
      tipo: 'atestado',
      status: 'pendente',
      criado_em: '2024-01-16T10:30:00Z'
    },
    {
      id: '3',
      funcionario: 'Ana Costa',
      data_inicio: '2024-02-01',
      data_fim: '2024-02-15',
      tipo: 'ferias',
      status: 'aprovada',
      criado_em: '2024-01-12T09:15:00Z'
    }
  ],

  monitoramento: [
    {
      id: '1',
      user_id: 'user1',
      secao: 'overview',
      timestamp: '2024-01-16T09:00:00Z',
      session_id: 'session_1234',
      duracao_segundos: 120
    },
    {
      id: '2',
      user_id: 'user1',
      secao: 'diretorio',
      timestamp: '2024-01-16T09:02:00Z',
      session_id: 'session_1234',
      duracao_segundos: 180
    },
    {
      id: '3',
      user_id: 'user2',
      secao: 'produto-foco',
      timestamp: '2024-01-16T10:15:00Z',
      session_id: 'session_5678',
      duracao_segundos: 240
    },
    {
      id: '4',
      user_id: 'user2',
      secao: 'folgas',
      timestamp: '2024-01-16T10:19:00Z',
      session_id: 'session_5678',
      duracao_segundos: 90
    },
    {
      id: '5',
      user_id: 'user3',
      secao: 'monitoramento',
      timestamp: '2024-01-16T11:30:00Z',
      session_id: 'session_9012',
      duracao_segundos: 300
    }
  ]
}; 