import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 20
const TOAST_REMOVE_DELAY = 1000
const TOAST_DEBOUNCE_DELAY = 1000 // Evitar toasts duplicados

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  duration?: number
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
const recentToasts = new Map<string, number>() // Para controlar toasts duplicados

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // Dismiss all toasts
      if (toastId === undefined) {
        return {
          ...state,
          toasts: state.toasts.map((t) => ({
            ...t,
            open: false,
          })),
        }
      }

      // Dismiss specific toast
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId ? { ...t, open: false } : t
        ),
      }
    }

    case "REMOVE_TOAST": {
      const { toastId } = action

      // Remove all toasts
      if (toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }

      // Remove specific toast
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== toastId),
      }
    }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// Função para gerar hash do toast para evitar duplicados
function getToastHash(props: Omit<ToasterToast, "id">): string {
  try {
    const content = JSON.stringify({
      title: props.title,
      description: props.description,
      variant: props.variant
    });
    
    // Usar uma função de hash simples que funciona com caracteres Unicode
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converter para 32bit int
    }
    
    // Converter para string positiva e limitar tamanho
    return Math.abs(hash).toString(36).substring(0, 20);
  } catch (error) {
    console.warn('Erro ao gerar hash do toast:', error);
    // Fallback: usar timestamp como identificador
    return Date.now().toString(36);
  }
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export function toast(props: Omit<ToasterToast, "id">) {
  // Verificar se é um toast duplicado
  const toastHash = getToastHash(props);
  const now = Date.now();
  const lastToastTime = recentToasts.get(toastHash);
  
  if (lastToastTime && (now - lastToastTime) < TOAST_DEBOUNCE_DELAY) {
    console.log('🚫 Toast duplicado ignorado:', props.title);
    return {
      id: '',
      dismiss: () => {},
      update: () => {}
    };
  }

  // Registrar este toast
  recentToasts.set(toastHash, now);

  // Limpar toasts antigos do cache
  const cutoffTime = now - (TOAST_DEBOUNCE_DELAY * 2);
  for (const [hash, time] of recentToasts.entries()) {
    if (time < cutoffTime) {
      recentToasts.delete(hash);
    }
  }

  const id = genId()

  const update = (props: Omit<Partial<ToasterToast>, "id">) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })

  const dismiss = () => {
    // Limpar timeout se existir
    if (toastTimeouts.has(id)) {
      clearTimeout(toastTimeouts.get(id))
      toastTimeouts.delete(id)
    }
    dispatch({ type: "DISMISS_TOAST", toastId: id })
    
    // Remover após delay
    setTimeout(() => {
      dispatch({ type: "REMOVE_TOAST", toastId: id })
    }, TOAST_REMOVE_DELAY)
  }

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) {
          dismiss()
        }
      },
    },
  })

  // Auto-dismiss se duration for especificada ou usar padrão de 5 segundos
  const duration = props.duration !== undefined ? props.duration : 5000;
  if (duration > 0) {
    const timeoutId = setTimeout(() => {
      dismiss()
    }, duration)
    
    toastTimeouts.set(id, timeoutId)
  }

  return {
    id,
    dismiss,
    update,
  }
}
