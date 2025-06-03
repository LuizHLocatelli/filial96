# Assistente de Produtividade - Chatbot

## Visão Geral

O **Assistente de Produtividade** é um chatbot inteligente integrado ao Hub de Produtividade, desenvolvido para ajudar os usuários com dúvidas gerais e aumentar a produtividade no trabalho.

## Características

- 🤖 **Interface moderna e intuitiva**
- 💬 **Respostas inteligentes e contextualizadas**
- 🎯 **Foco em produtividade e organização**
- 📱 **Design responsivo**
- ⚡ **Respostas rápidas e dinâmicas**

## Funcionalidades

### 1. Respostas Inteligentes
O chatbot pode responder perguntas sobre:
- Rotinas e tarefas
- Dicas de produtividade
- Organização do trabalho
- Navegação no Hub de Produtividade
- Relatórios e monitoramento
- Orientações da empresa

### 2. Interface do Usuário
- **Botão flutuante**: Sempre visível no canto inferior direito
- **Modal de chat**: Interface limpa e moderna
- **Indicador de digitação**: Feedback visual durante respostas
- **Histórico de mensagens**: Mantém o contexto da conversa
- **Sugestões rápidas**: Perguntas pré-definidas para facilitar o uso

### 3. Funcionalidades Avançadas
- **Copiar mensagens**: Usuário pode copiar respostas úteis
- **Limpar conversa**: Reset completo do histórico
- **Timestamps**: Controle de tempo das mensagens
- **Estados visuais**: Loading, typing, online status

## Como Usar

### 1. Acesso
- O chatbot aparece como um botão flutuante no Hub de Produtividade
- Clique no botão para abrir a interface de chat

### 2. Interação
- Digite sua pergunta no campo de mensagem
- Use as sugestões rápidas para perguntas comuns
- O assistente responderá de forma contextualizada

### 3. Comandos e Tópicos Reconhecidos
- **Saudações**: "olá", "oi", "bom dia", "boa tarde"
- **Ajuda**: "ajuda", "help"
- **Rotinas**: "rotina", "rotinas"
- **Produtividade**: "produtividade", "produtivo"
- **Tarefas**: "tarefa", "tarefas"
- **Relatórios**: "relatório", "relatórios"
- **Monitoramento**: "monitoramento", "acompanhar"
- **Instruções**: "como usar"
- **Despedida**: "tchau", "bye", "até logo"

## Arquitetura Técnica

### Componentes
- `ProductivityAssistant.tsx`: Componente principal do chatbot
- `useChatbot.ts`: Hook personalizado para gerenciamento de estado

### Dependências
- React (hooks: useState, useRef, useEffect)
- Lucide React (ícones)
- Shadcn/ui (componentes base)
- Tailwind CSS (estilização)

### Estado
```typescript
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotState {
  messages: Message[];
  isTyping: boolean;
  isOpen: boolean;
}
```

## Personalização

### Respostas
As respostas podem ser expandidas editando a função `getSmartResponse` no hook `useChatbot.ts`.

### Estilo
O design utiliza as variáveis CSS do projeto e pode ser personalizado através das classes Tailwind.

### Comportamento
O tempo de resposta e animações podem ser ajustados nos timeouts do hook.

## Integração

O chatbot está integrado ao `HubProdutividade.tsx` e pode ser facilmente adicionado a outras páginas:

```tsx
import { ProductivityAssistant } from "@/components/moveis/hub-produtividade/components/chatbot/ProductivityAssistant";

function MyPage() {
  const [showChatbot, setShowChatbot] = useState(false);
  
  return (
    <div>
      {/* Seu conteúdo */}
      <ProductivityAssistant
        isOpen={showChatbot}
        onToggle={() => setShowChatbot(!showChatbot)}
      />
    </div>
  );
}
```

## Futuras Melhorias

- [ ] Integração com IA real (OpenAI, Claude, etc.)
- [ ] Histórico persistente de conversas
- [ ] Busca em tempo real no banco de dados
- [ ] Notificações proativas
- [ ] Múltiplos idiomas
- [ ] Analytics de uso
- [ ] Integração com calendário
- [ ] Comandos de voz

## Manutenção

Para adicionar novas respostas:
1. Edite a função `getSmartResponse` em `useChatbot.ts`
2. Adicione novos padrões de reconhecimento
3. Teste as novas funcionalidades

## Suporte

Para dúvidas sobre implementação ou customização, consulte a documentação do projeto principal. 