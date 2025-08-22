import { createContext, useContext, ReactNode } from 'react'

type ContextType = 'dashboard' | 'form' | 'table' | 'modal' | 'sidebar' | 'header' | 'default'

interface ContextDefaults {
  // Layout defaults
  spacing: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  borderRadius: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shadow: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  
  // Typography defaults
  textSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  textColor: 'primary' | 'secondary' | 'muted'
  
  // Component defaults
  cardVariant: 'elevated' | 'outline' | 'subtle' | 'filled' | 'ghost'
  buttonSize: 'xs' | 'sm' | 'md' | 'lg'
  badgeSize: 'xs' | 'sm' | 'md' | 'lg'
  
  // Interaction defaults
  interactive: boolean
  emphasis: 'low' | 'medium' | 'high'
}

const contextDefaults: Record<ContextType, ContextDefaults> = {
  dashboard: {
    spacing: 'lg',
    borderRadius: 'md',
    shadow: 'md',
    textSize: 'md',
    textColor: 'primary',
    cardVariant: 'elevated',
    buttonSize: 'md',
    badgeSize: 'sm',
    interactive: true,
    emphasis: 'high',
  },
  form: {
    spacing: 'md',
    borderRadius: 'sm',
    shadow: 'sm',
    textSize: 'sm',
    textColor: 'primary',
    cardVariant: 'outline',
    buttonSize: 'md',
    badgeSize: 'sm',
    interactive: false,
    emphasis: 'medium',
  },
  table: {
    spacing: 'sm',
    borderRadius: 'xs',
    shadow: 'xs',
    textSize: 'sm',
    textColor: 'secondary',
    cardVariant: 'subtle',
    buttonSize: 'sm',
    badgeSize: 'xs',
    interactive: true,
    emphasis: 'low',
  },
  modal: {
    spacing: 'lg',
    borderRadius: 'lg',
    shadow: 'xl',
    textSize: 'md',
    textColor: 'primary',
    cardVariant: 'elevated',
    buttonSize: 'md',
    badgeSize: 'sm',
    interactive: false,
    emphasis: 'high',
  },
  sidebar: {
    spacing: 'sm',
    borderRadius: 'sm',
    shadow: 'sm',
    textSize: 'sm',
    textColor: 'secondary',
    cardVariant: 'ghost',
    buttonSize: 'sm',
    badgeSize: 'xs',
    interactive: true,
    emphasis: 'medium',
  },
  header: {
    spacing: 'md',
    borderRadius: 'sm',
    shadow: 'sm',
    textSize: 'md',
    textColor: 'primary',
    cardVariant: 'subtle',
    buttonSize: 'sm',
    badgeSize: 'sm',
    interactive: true,
    emphasis: 'medium',
  },
  default: {
    spacing: 'md',
    borderRadius: 'md',
    shadow: 'sm',
    textSize: 'md',
    textColor: 'primary',
    cardVariant: 'elevated',
    buttonSize: 'md',
    badgeSize: 'sm',
    interactive: false,
    emphasis: 'medium',
  },
}

interface SmartDefaultsContextValue {
  context: ContextType
  defaults: ContextDefaults
  setContext: (context: ContextType) => void
}

const SmartDefaultsContext = createContext<SmartDefaultsContextValue | null>(null)

export function SmartDefaultsProvider({ 
  children, 
  initialContext = 'default' 
}: { 
  children: ReactNode
  initialContext?: ContextType 
}) {
  const [currentContext, setCurrentContext] = useState<ContextType>(initialContext)
  
  const value: SmartDefaultsContextValue = {
    context: currentContext,
    defaults: contextDefaults[currentContext],
    setContext: setCurrentContext,
  }

  return (
    <SmartDefaultsContext.Provider value={value}>
      {children}
    </SmartDefaultsContext.Provider>
  )
}

export function useSmartDefaults(): SmartDefaultsContextValue {
  const context = useContext(SmartDefaultsContext)
  if (!context) {
    // Return default context if provider is not found
    return {
      context: 'default',
      defaults: contextDefaults.default,
      setContext: () => {},
    }
  }
  return context
}

// Hook para aplicar defaults inteligentes a props de componentes
export function useContextualProps<T extends Record<string, any>>(
  props: T,
  componentType: 'card' | 'button' | 'badge' | 'typography' | 'layout'
): T {
  const { defaults } = useSmartDefaults()

  const contextualDefaults: Partial<T> = {}

  switch (componentType) {
    case 'card':
      if (!props.variant) contextualDefaults.variant = defaults.cardVariant as any
      if (!props.shadow) contextualDefaults.shadow = defaults.shadow as any
      if (!props.borderRadius) contextualDefaults.borderRadius = defaults.borderRadius as any
      if (!props.interactive) contextualDefaults.interactive = defaults.interactive as any
      break

    case 'button':
      if (!props.size) contextualDefaults.size = defaults.buttonSize as any
      break

    case 'badge':
      if (!props.size) contextualDefaults.size = defaults.badgeSize as any
      break

    case 'typography':
      if (!props.size) contextualDefaults.size = defaults.textSize as any
      if (!props.color) contextualDefaults.color = defaults.textColor as any
      break

    case 'layout':
      if (!props.padding) contextualDefaults.padding = defaults.spacing as any
      if (!props.borderRadius) contextualDefaults.borderRadius = defaults.borderRadius as any
      break
  }

  return { ...contextualDefaults, ...props }
}

// HOC para inyectar context automáticamente
export function withSmartDefaults<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  componentType: 'card' | 'button' | 'badge' | 'typography' | 'layout'
) {
  return function SmartDefaultsWrapper(props: P) {
    const contextualProps = useContextualProps(props, componentType)
    return <Component {...contextualProps} />
  }
}

// Componente para cambiar el contexto en áreas específicas
export function ContextArea({ 
  context, 
  children 
}: { 
  context: ContextType
  children: ReactNode 
}) {
  const { setContext } = useSmartDefaults()
  
  useEffect(() => {
    const previousContext = useSmartDefaults().context
    setContext(context)
    
    return () => {
      setContext(previousContext)
    }
  }, [context, setContext])

  return <>{children}</>
}

// Hooks especializados para contextos específicos
export function useDashboardDefaults() {
  return contextDefaults.dashboard
}

export function useFormDefaults() {
  return contextDefaults.form
}

export function useTableDefaults() {
  return contextDefaults.table
}

export function useModalDefaults() {
  return contextDefaults.modal
}

// Componentes wrapper que aplican contexto automáticamente
export function DashboardArea({ children }: { children: ReactNode }) {
  return <ContextArea context="dashboard">{children}</ContextArea>
}

export function FormArea({ children }: { children: ReactNode }) {
  return <ContextArea context="form">{children}</ContextArea>
}

export function TableArea({ children }: { children: ReactNode }) {
  return <ContextArea context="table">{children}</ContextArea>
}

export function ModalArea({ children }: { children: ReactNode }) {
  return <ContextArea context="modal">{children}</ContextArea>
}

export function SidebarArea({ children }: { children: ReactNode }) {
  return <ContextArea context="sidebar">{children}</ContextArea>
}

export function HeaderArea({ children }: { children: ReactNode }) {
  return <ContextArea context="header">{children}</ContextArea>
}

// Utilities para detectar contexto automáticamente basado en la ruta o componente padre
export function useAutoContext(): ContextType {
  const pathname = window.location?.pathname || ''
  
  // Detectar contexto basado en la URL
  if (pathname.includes('/dashboard')) return 'dashboard'
  if (pathname.includes('/settings')) return 'form'
  if (pathname.includes('/reports')) return 'table'
  
  // Detectar contexto basado en el componente padre (simplificado)
  const element = document.querySelector('[data-context]')
  if (element) {
    return element.getAttribute('data-context') as ContextType
  }
  
  return 'default'
}

// React 18 import fix
import { useState, useEffect } from 'react'