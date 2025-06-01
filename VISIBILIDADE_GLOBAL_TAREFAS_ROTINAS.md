# Implementação de Visibilidade Global para Tarefas e Rotinas

## Resumo das Mudanças

Este documento descreve as alterações implementadas para permitir que **todas as tarefas e rotinas criadas por qualquer usuário sejam visíveis para todos os tipos de usuários** no sistema.

## Mudanças no Banco de Dados (Supabase)

### 1. Políticas RLS Atualizadas

#### Antes:
- **moveis_rotinas**: Usuários só podiam ver suas próprias rotinas (`auth.uid() = created_by`)
- **moveis_rotinas_conclusoes**: Usuários só podiam ver suas próprias conclusões (`auth.uid() = created_by`)
- **moveis_tarefas**: Já permitia visualização global (`qual="true"`)

#### Depois:
- **moveis_rotinas**: Todos os usuários autenticados podem ver todas as rotinas (`auth.uid() IS NOT NULL`)
- **moveis_rotinas_conclusoes**: Todos os usuários autenticados podem ver todas as conclusões (`auth.uid() IS NOT NULL`)
- **moveis_tarefas**: Mantido como estava (já permitia visualização global)

### 2. Migração Aplicada

```sql
-- Migração: enable_global_visibility_for_rotinas

-- 1. Remover política restritiva de SELECT para rotinas
DROP POLICY IF EXISTS "Users can view their own routines" ON moveis_rotinas;

-- 2. Criar nova política que permite a todos os usuários autenticados verem todas as rotinas
CREATE POLICY "All users can view all routines" ON moveis_rotinas
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- 3. Remover política restritiva de SELECT para conclusões de rotinas
DROP POLICY IF EXISTS "Users can view their own routine completions" ON moveis_rotinas_conclusoes;

-- 4. Criar nova política que permite a todos os usuários autenticados verem todas as conclusões
CREATE POLICY "All users can view all routine completions" ON moveis_rotinas_conclusoes
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);
```

### 3. Segurança Mantida

As políticas de **INSERT**, **UPDATE** e **DELETE** permanecem restritivas:
- Usuários só podem criar/editar/excluir suas próprias rotinas
- Usuários só podem criar/editar/excluir suas próprias conclusões
- Usuários só podem criar/editar/excluir suas próprias tarefas

## Mudanças no Frontend

### 1. Componente RotinasList.tsx

**Funcionalidades Adicionadas:**
- Busca automática dos nomes dos criadores das rotinas
- Exibição do nome do criador em cada card de rotina
- Interface `RotinaWithCreator` para tipagem
- Hook `useEffect` para carregar nomes dos perfis

**Código Adicionado:**
```typescript
interface RotinaWithCreator extends RotinaWithStatus {
  criador_nome?: string;
}

// Buscar nomes dos criadores
useEffect(() => {
  const fetchCreatorNames = async () => {
    if (rotinas.length === 0) return;

    const creatorIds = [...new Set(rotinas.map(r => r.created_by))];
    
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', creatorIds);

    // ... lógica para mapear nomes
  };

  fetchCreatorNames();
}, [rotinas]);
```

### 2. Componente TarefaCard.tsx

**Funcionalidades Adicionadas:**
- Busca automática do nome do criador da tarefa
- Exibição do nome do criador em cada card de tarefa
- Interface `TarefaWithCreator` para tipagem
- Hook `useEffect` para carregar nome do perfil

**Código Adicionado:**
```typescript
interface TarefaWithCreator extends Tarefa {
  criador_nome?: string;
}

// Buscar nome do criador
useEffect(() => {
  const fetchCreatorName = async () => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', tarefa.criado_por)
      .single();

    // ... lógica para definir nome
  };

  fetchCreatorName();
}, [tarefa]);
```

## Comportamento Atual

### ✅ O que os usuários podem fazer:

1. **Visualizar todas as rotinas** criadas por qualquer usuário
2. **Visualizar todas as tarefas** criadas por qualquer usuário
3. **Ver quem criou** cada rotina e tarefa
4. **Marcar como concluída** qualquer rotina (criando sua própria conclusão)
5. **Atualizar status** de qualquer tarefa

### 🔒 Restrições de segurança mantidas:

1. **Editar/Excluir rotinas**: Apenas o criador pode editar ou excluir suas próprias rotinas
2. **Editar/Excluir tarefas**: Apenas usuários autenticados podem editar/excluir tarefas
3. **Criar conclusões**: Cada usuário cria suas próprias conclusões de rotinas

## Benefícios da Implementação

1. **Transparência**: Todos podem ver o trabalho sendo realizado
2. **Colaboração**: Facilita o trabalho em equipe
3. **Visibilidade**: Gerentes podem acompanhar todas as atividades
4. **Responsabilidade**: Cada item mostra claramente quem foi o criador
5. **Flexibilidade**: Qualquer usuário pode marcar rotinas como concluídas

## Tipos de Usuários Beneficiados

- **Gerentes**: Podem ver todas as atividades do setor
- **Crediaristas**: Podem acompanhar rotinas e tarefas de móveis
- **Consultores de Móveis**: Podem ver atividades de outros consultores
- **Consultores de Moda**: Podem acompanhar atividades gerais

## Testes Realizados

1. ✅ Políticas RLS atualizadas corretamente
2. ✅ Consultas SQL retornando dados de todos os usuários
3. ✅ Frontend exibindo nomes dos criadores
4. ✅ Funcionalidades de edição/exclusão mantidas seguras

## Próximos Passos Sugeridos

1. **Notificações**: Implementar notificações quando novas tarefas/rotinas são criadas
2. **Filtros**: Adicionar filtros por criador na interface
3. **Relatórios**: Criar relatórios de produtividade por usuário
4. **Permissões avançadas**: Considerar permissões específicas por tipo de usuário se necessário 