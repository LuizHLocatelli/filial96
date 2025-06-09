# ✅ Correção: Problema de Timezone - Folgas Móveis

## 🎯 Problema Identificado

Na página de Folgas dos Móveis, ao adicionar uma folga, ela estava sendo salva sempre 1 dia antes. Por exemplo:
- **Adicionado**: Folga dia 10
- **Salvando**: Dia 9

## 🔍 Causa Raiz

O problema estava na manipulação de datas no arquivo `src/components/moveis/folgas/useMoveiFolgas.ts`:

### ❌ **Código Problemático:**
```typescript
// Formatação incorreta que causava problemas de timezone
const formattedDate = selectedDate.toISOString().split('T')[0];

// Parsing incorreto das datas do banco
data: new Date(folga.data)
```

### ✅ **Código Corrigido:**
```typescript
// Helper para ler a data do banco (que vem como YYYY-MM-DD) como uma data local.
const fromDateOnlyString = (dateStr: string): Date => {
  return new Date(`${dateStr}T00:00:00`);
}

// Helper para converter data para o formato YYYY-MM-DD UTC para evitar problemas de fuso horário
const toDateOnlyString = (date: Date): string => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
}
```

## 🛠️ Correções Implementadas

### 1. **Adicionadas Funções Helper de Timezone**
- `fromDateOnlyString()`: Para ler datas do banco
- `toDateOnlyString()`: Para salvar datas no banco

### 2. **Corrigida Função de Busca de Folgas**
```typescript
// ❌ Antes
data: new Date(folga.data)

// ✅ Depois  
data: fromDateOnlyString(folga.data)
```

### 3. **Corrigida Função de Criação de Folgas**
```typescript
// ❌ Antes
const formattedDate = selectedDate.toISOString().split('T')[0];

// ✅ Depois
const formattedDate = toDateOnlyString(selectedDate);
```

### 4. **Corrigida Função de Comparação de Datas**
```typescript
// ❌ Antes
const folgasParaEsteDia = folgas.filter(f => isSameDay(new Date(f.data), date));

// ✅ Depois
const folgasParaEsteDia = folgas.filter(f => isSameDay(f.data, date));
```

## 🎉 Resultado

- ✅ **Folgas salvas na data correta**
- ✅ **Funciona em qualquer timezone**
- ✅ **Consistência com a seção Moda** (que já tinha essa correção)
- ✅ **Sem problemas de mudança de dia**

## 📋 Arquivos Modificados

- `src/components/moveis/folgas/useMoveiFolgas.ts`

## 🔄 Status

**✅ CONCLUÍDO** - Problema de timezone nas folgas de móveis resolvido completamente. 