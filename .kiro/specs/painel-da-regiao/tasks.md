# Implementation Plan - Painel da Região

- [x] 1. Criar estrutura base de tipos e configuração


  - Criar arquivo de tipos TypeScript para ExternalLink e InternalTool
  - Criar arquivo de configuração centralizado com os dados dos links e ferramentas
  - Definir interfaces para PainelConfig
  - _Requirements: 6.3, 6.4_

- [x] 2. Implementar componente BackgroundPattern


  - Criar componente reutilizável para o padrão de fundo animado
  - Aplicar estilos consistentes com outras páginas do app (Calculadora iGreen)
  - _Requirements: 1.5_

- [x] 3. Implementar componente LinkCard para links externos


  - Criar card com glassmorphism effect
  - Implementar abertura de link em nova aba com segurança (noopener, noreferrer)
  - Adicionar badge "Externo" com ícone ExternalLink
  - Implementar hover effects e transições suaves
  - Adicionar suporte a navegação por teclado (Tab, Enter, Space)
  - Incluir ARIA labels para acessibilidade
  - _Requirements: 2.3, 2.4, 2.7, 2.8, 5.3, 5.4, 5.5_

- [x] 4. Implementar componente ToolCard para ferramentas internas


  - Criar card com glassmorphism effect similar ao LinkCard
  - Implementar navegação interna usando useNavigate do React Router
  - Adicionar suporte a badges opcionais (ex: "Popular", "Novo")
  - Implementar hover effects e transições suaves
  - Adicionar suporte a navegação por teclado
  - Incluir ARIA labels para acessibilidade
  - _Requirements: 3.3, 3.4, 3.5_

- [x] 5. Implementar componente QuickAccessSection


  - Criar seção com título "Acesso Rápido" e ícone ExternalLink
  - Implementar grid responsivo (2 colunas mobile, 3 desktop)
  - Renderizar LinkCards a partir do array de configuração
  - Aplicar espaçamentos consistentes com design system
  - _Requirements: 2.1, 2.2, 2.5, 2.6_

- [x] 6. Implementar componente ToolsSection


  - Criar seção com título "Ferramentas da Região" e ícone Wrench
  - Implementar grid responsivo (2 colunas mobile, 3 desktop)
  - Renderizar ToolCards a partir do array de configuração
  - Aplicar espaçamentos consistentes com design system
  - _Requirements: 3.1, 3.2, 3.6_

- [x] 7. Implementar página principal PainelDaRegiao


  - Criar componente de página usando PageLayout e PageHeader
  - Integrar BackgroundPattern para consistência visual
  - Integrar QuickAccessSection com dados de links externos
  - Integrar ToolsSection com dados de ferramentas internas
  - Aplicar animações de entrada (fade-in)
  - Garantir responsividade mobile-first
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 8. Configurar rota no AppRoutes


  - Adicionar rota `/painel-da-regiao` no AppRoutes.tsx
  - Configurar como rota pública (sem ProtectedRoute)
  - Implementar sem AppLayout (standalone, similar à Calculadora iGreen)
  - Adicionar lazy loading para otimização de performance
  - _Requirements: 4.1, 4.3, 5.1_

- [x] 9. Adicionar navegação de retorno

  - Implementar botão de voltar para o hub principal
  - Posicionar botão de forma consistente com outras páginas standalone
  - Adicionar ícone e label descritivo
  - _Requirements: 4.2_

- [x] 10. Implementar otimizações de performance


  - Aplicar React.memo nos componentes LinkCard e ToolCard
  - Garantir que a página carregue em menos de 2 segundos em 3G
  - Otimizar imports e bundle size
  - _Requirements: 5.1_

- [x] 11. Validação e testes de acessibilidade


  - Verificar contraste de cores (WCAG AA)
  - Testar navegação completa por teclado
  - Validar com leitor de tela
  - Verificar focus indicators em todos os elementos interativos
  - Testar em diferentes tamanhos de tela (mobile, tablet, desktop)
  - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 12. Integração final e ajustes de design



  - Revisar consistência visual com design system
  - Ajustar espaçamentos e tamanhos conforme necessário
  - Verificar comportamento em dark mode
  - Testar todos os links externos e navegação interna
  - Validar responsividade em dispositivos reais
  - _Requirements: 1.3, 1.4, 2.8, 3.5_
