# Sistema de Monitoramento de Orientações

## Visão Geral

O sistema de monitoramento de orientações foi implementado para rastrear e garantir que todos os usuários dos cargos específicos (Consultores de Móveis, Consultores de Moda e Jovens Aprendizes) visualizem as orientações e informativos publicados.

## Funcionalidades Implementadas

### 1. Estrutura do Banco de Dados

#### Nova Tabela: `moveis_orientacoes_visualizacoes`
```sql
CREATE TABLE moveis_orientacoes_visualizacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  orientacao_id UUID NOT NULL REFERENCES moveis_orientacoes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_role TEXT NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(orientacao_id, user_id)
);
```

#### Funções RPC Criadas

1. **`register_orientacao_view(p_orientacao_id, p_user_id)`**
   - Registra que um usuário visualizou uma orientação
   - Obtém automaticamente o cargo do usuário
   - Evita registros duplicados

2. **`check_orientacao_completion_by_role(p_orientacao_id, p_target_roles)`**
   - Verifica se todos os usuários de determinados cargos visualizaram uma orientação
   - Retorna estatísticas detalhadas por cargo
   - Lista usuários pendentes

3. **`get_orientacoes_viewing_stats(p_target_roles)`**
   - Obtém estatísticas completas de todas as orientações
   - Retorna dados consolidados de visualização por cargo

### 2. Hook de Monitoramento

#### `useOrientacoesMonitoring`
O hook personalizado gerencia todo o estado e operações de monitoramento:

**Estados:**
- `monitoramentoStats`: Estatísticas consolidadas
- `isLoading`: Estado de carregamento
- `error`: Mensagens de erro

**Funções:**
- `registerView(orientacaoId)`: Registra visualização do usuário atual
- `checkOrientacaoCompletion(orientacaoId)`: Verifica conclusão por cargo
- `fetchMonitoringStats()`: Busca todas as estatísticas
- `getPendingUsers(orientacaoId)`: Lista usuários pendentes
- `isOrientacaoComplete(orientacaoId)`: Verifica se orientação foi 100% visualizada
- `getRoleStats(orientacaoId, role)`: Obtém estatísticas de um cargo específico
- `hasUserViewedOrientacao(orientacaoId)`: Verifica se usuário atual já visualizou

### 3. Componente de Interface

#### `OrientacoesMonitoramento`
Interface completa para visualização e gerenciamento do monitoramento:

**Características:**
- Dashboard com estatísticas gerais
- Cards detalhados por orientação
- Progresso visual por cargo
- Lista de usuários pendentes
- Botão para registrar visualização
- Indicadores visuais de status (completo/pendente)

**Métricas Exibidas:**
- Total de orientações
- Orientações completas (100% visualizadas)
- Orientações pendentes
- Percentual geral de conclusão
- Progresso por cargo (Móveis, Moda, Jovem Aprendiz)

### 4. Integração no Hub de Produtividade

#### Nova Seção "Monitoramento"
- Adicionada como quinta aba no Hub
- Ícone: Users (Lucide React)
- Acessível tanto em desktop quanto mobile
- Layout responsivo adaptado para 5 seções

## Como Usar

### Para Usuários Finais

1. **Visualizar Status Geral**
   - Acesse a aba "Monitoramento" no Hub de Produtividade
   - Veja o dashboard com estatísticas consolidadas

2. **Registrar Visualização**
   - Clique no botão "Registrar Visualização" em qualquer orientação
   - O sistema automaticamente identifica seu cargo
   - A visualização é registrada instantaneamente

3. **Acompanhar Progresso**
   - Veja barras de progresso por cargo
   - Identifique colegas que ainda não visualizaram
   - Monitore o percentual de conclusão

### Para Administradores

1. **Monitorar Compliance**
   - Acompanhe se todos os usuários estão visualizando orientações
   - Identifique orientações com baixa taxa de visualização
   - Liste usuários específicos que ainda não visualizaram

2. **Relatórios em Tempo Real**
   - Dados atualizados automaticamente
   - Botão de atualização manual disponível
   - Estatísticas detalhadas por cargo

## Cargos Monitorados

O sistema monitora especificamente estes cargos:
- **`consultor_moveis`**: Consultores de Móveis
- **`consultor_moda`**: Consultores de Moda  
- **`jovem_aprendiz`**: Jovens Aprendizes

## Tipos de Orientação

O sistema categoriza orientações por tipo:
- **VM**: Visual Merchandising
- **Informativo**: Informações gerais
- **Outro**: Outras categorias

## Indicadores Visuais

### Status por Orientação
- 🟢 **Verde**: Todos os cargos visualizaram (100%)
- 🟠 **Laranja**: Alguns usuários ainda não visualizaram

### Status por Cargo
- ✅ **Check**: Cargo completou 100%
- ⚠️ **Alerta**: Cargo ainda tem usuários pendentes

### Cores por Cargo
- 🔵 **Azul**: Consultores de Móveis
- 🟣 **Rosa**: Consultores de Moda
- 🟢 **Verde**: Jovens Aprendizes

## Otimizações Implementadas

1. **Performance**
   - Funções RPC otimizadas no PostgreSQL
   - Índices específicos para consultas rápidas
   - Cache automático de estatísticas

2. **UX/UI**
   - Interface responsiva
   - Loading states apropriados
   - Feedback visual imediato
   - Tratamento de erros

3. **Segurança**
   - Funções com SECURITY DEFINER
   - Validação de permissões
   - Prevenção de registros duplicados

## Estrutura de Arquivos

```
src/components/moveis/hub-produtividade/
├── components/
│   └── OrientacoesMonitoramento.tsx    # Componente principal
├── hooks/
│   └── useOrientacoesMonitoring.ts     # Hook de monitoramento
├── types.ts                            # Tipos TypeScript
├── constants/
│   └── hubSections.ts                  # Configuração das seções
└── components/layouts/
    ├── HubDesktopLayout.tsx            # Layout desktop
    └── HubMobileLayout.tsx             # Layout mobile
```

## Próximos Passos

### Melhorias Futuras
1. **Notificações Push**: Alertar usuários sobre novas orientações
2. **Relatórios Exportáveis**: PDF/Excel com estatísticas
3. **Dashboard Administrativo**: Interface específica para gestores
4. **Lembretes Automáticos**: Email/SMS para usuários pendentes
5. **Histórico de Visualizações**: Timeline detalhado por usuário
6. **Gamificação**: Badges e conquistas por engajamento

### Métricas Adicionais
1. **Tempo Médio de Visualização**: Por cargo e orientação
2. **Taxa de Engajamento**: Percentual de visualizações por período
3. **Trending**: Orientações mais e menos visualizadas
4. **Compliance por Período**: Histórico de aderência às políticas 