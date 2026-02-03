import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export interface HubKeyboardShortcuts {
  onBuscaAvancada: () => void;
  onFiltrosPorData: () => void;
  onRelatorios: () => void;
  onRefreshData: () => void;
  onExportData: () => void;
}

export function useKeyboardShortcuts(
  handlers: HubKeyboardShortcuts,
  enabled: boolean = true
) {
  // Definir os atalhos de teclado
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'f',
      ctrl: true,
      action: handlers.onBuscaAvancada,
      description: 'Busca Avançada'
    },
    {
      key: 'd',
      ctrl: true,
      action: handlers.onFiltrosPorData,
      description: 'Filtros por Data'
    },
    {
      key: 'l',
      ctrl: true,
      action: handlers.onRelatorios,
      description: 'Relatórios'
    },
    {
      key: 'F5',
      action: handlers.onRefreshData,
      description: 'Atualizar Dados'
    },
    {
      key: 'e',
      ctrl: true,
      action: handlers.onExportData,
      description: 'Exportar'
    }
  ];

  // Verificar se uma combinação de teclas corresponde a um atalho
  const matchesShortcut = useCallback((event: KeyboardEvent, shortcut: KeyboardShortcut) => {
    // Verificar a tecla principal
    if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) {
      return false;
    }

    // Verificar modificadores
    const ctrlPressed = event.ctrlKey || event.metaKey; // Mac usa metaKey
    const altPressed = event.altKey;
    const shiftPressed = event.shiftKey;

    return (
      (shortcut.ctrl ? ctrlPressed : !ctrlPressed) &&
      (shortcut.alt ? altPressed : !altPressed) &&
      (shortcut.shift ? shiftPressed : !shiftPressed)
    );
  }, []);

  // Handler do evento de teclado
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignorar se estiver em um input, textarea, ou elemento editável
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.closest('[contenteditable="true"]')
    ) {
      return;
    }

    // Procurar atalho correspondente
    for (const shortcut of shortcuts) {
      if (matchesShortcut(event, shortcut)) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.action();
        break;
      }
    }
  }, [enabled, shortcuts, matchesShortcut]);

  // Adicionar/remover event listeners
  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enabled, handleKeyDown]);

  // Obter lista de atalhos para exibição
  const getShortcutsList = useCallback(() => {
    return shortcuts.map(shortcut => ({
      description: shortcut.description,
      combination: [
        shortcut.ctrl && (navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'),
        shortcut.alt && 'Alt',
        shortcut.shift && 'Shift',
        shortcut.key.toUpperCase()
      ].filter(Boolean).join(' + ')
    }));
  }, [shortcuts]);

  return {
    shortcuts,
    getShortcutsList,
    enabled
  };
}
