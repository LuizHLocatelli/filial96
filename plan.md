## Passo 1: Atualizar `ChatInput.tsx`
- Adicionar prop `variant?: 'default' | 'floating'`.
- Ajustar as classes baseadas no `variant`. O `floating` deve ter bordas totalmente arredondadas e remover a borda superior reta.
- Refinar as animações de foco e hover.

## Passo 2: Atualizar `AssistenteChat.tsx`
- Substituir o ícone genérico pelo `assistant.avatar_icon` na tela inicial. Se não houver, usar um fallback bonito.
- Adicionar o fundo "glow" sutil.
- Ajustar a tipografia do título e espaçamentos.
- Passar `variant="floating"` para o `ChatInput` na tela inicial.
