import { DialogRoot, DialogTrigger, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogTitle, DialogDescription, DialogCloseTrigger, Portal } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { withDisplayName } from './utils/compoundUtils'

interface ModalProps {
  children: ReactNode
  isOpen?: boolean
  onClose?: () => void
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  centered?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  blockScrollOnMount?: boolean
  preserveScrollBarGap?: boolean
  className?: string
}

interface ModalTriggerProps {
  children: ReactNode
  asChild?: boolean
}

interface ModalContentProps {
  children: ReactNode
  className?: string
}

interface ModalHeaderProps {
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

interface ModalBodyProps {
  children: ReactNode
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg'
  scrollable?: boolean
  className?: string
}

interface ModalFooterProps {
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  justify?: 'start' | 'center' | 'end' | 'space-between'
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

interface ModalTitleProps {
  children: ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  className?: string
}

interface ModalDescriptionProps {
  children: ReactNode
  className?: string
}

interface ModalCloseProps {
  children?: ReactNode
  className?: string
}

const paddingMap = {
  none: 0,
  xs: 2,
  sm: 3,
  md: 4,
  lg: 6,
}

const sizeMap = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  full: 'full',
}

export function Modal({
  children,
  isOpen,
  onClose,
  size = 'md',
  centered = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  blockScrollOnMount = true,
  preserveScrollBarGap = true,
  className,
  ...rest
}: ModalProps) {
  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open && onClose) {
          onClose()
        }
      }}
      size={sizeMap[size]}
      centered={centered}
      closeOnInteractOutside={closeOnOverlayClick}
      closeOnEscape={closeOnEscape}
      preventScroll={blockScrollOnMount}
      className={className}
      {...rest}
    >
      {children}
    </DialogRoot>
  )
}

export function ModalTrigger({ children, asChild = false }: ModalTriggerProps) {
  return (
    <DialogTrigger asChild={asChild}>
      {children}
    </DialogTrigger>
  )
}

export function ModalContent({ 
  children, 
  className,
  ...rest 
}: ModalContentProps) {
  return (
    <Portal>
      <DialogContent 
        className={className}
        {...rest}
      >
        {children}
      </DialogContent>
    </Portal>
  )
}

export function ModalHeader({ 
  children, 
  align = 'start',
  padding = 'lg',
  className,
  ...rest 
}: ModalHeaderProps) {
  const alignMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
  }

  return (
    <DialogHeader 
      display="flex"
      alignItems={alignMap[align]}
      p={paddingMap[padding]}
      className={className}
      {...rest}
    >
      {children}
    </DialogHeader>
  )
}

export function ModalBody({ 
  children, 
  padding = 'lg',
  scrollable = false,
  className,
  ...rest 
}: ModalBodyProps) {
  return (
    <DialogBody 
      p={paddingMap[padding]}
      overflow={scrollable ? 'auto' : 'visible'}
      className={className}
      {...rest}
    >
      {children}
    </DialogBody>
  )
}

export function ModalFooter({ 
  children, 
  align = 'center',
  justify = 'end',
  padding = 'lg',
  className,
  ...rest 
}: ModalFooterProps) {
  const alignMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
  }
  
  const justifyMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    'space-between': 'space-between',
  }

  return (
    <DialogFooter 
      display="flex"
      alignItems={alignMap[align]}
      justifyContent={justifyMap[justify]}
      gap="sm"
      p={paddingMap[padding]}
      className={className}
      {...rest}
    >
      {children}
    </DialogFooter>
  )
}

export function ModalTitle({ 
  children, 
  as = 'h2',
  className,
  ...rest 
}: ModalTitleProps) {
  return (
    <DialogTitle 
      as={as}
      fontSize="xl"
      fontWeight="semibold"
      className={className}
      {...rest}
    >
      {children}
    </DialogTitle>
  )
}

export function ModalDescription({ 
  children, 
  className,
  ...rest 
}: ModalDescriptionProps) {
  return (
    <DialogDescription 
      fontSize="sm"
      className={className}
      {...rest}
    >
      {children}
    </DialogDescription>
  )
}

export function ModalClose({ 
  children,
  className,
  ...rest 
}: ModalCloseProps) {
  return (
    <DialogCloseTrigger 
      className={className}
      {...rest}
    >
      {children}
    </DialogCloseTrigger>
  )
}

// Apply displayNames for compound detection
withDisplayName(ModalTrigger, 'ModalTrigger')
withDisplayName(ModalContent, 'ModalContent')
withDisplayName(ModalHeader, 'ModalHeader')
withDisplayName(ModalBody, 'ModalBody')
withDisplayName(ModalFooter, 'ModalFooter')
withDisplayName(ModalTitle, 'ModalTitle')
withDisplayName(ModalDescription, 'ModalDescription')
withDisplayName(ModalClose, 'ModalClose')

// Compound component pattern
Modal.Trigger = ModalTrigger
Modal.Content = ModalContent
Modal.Header = ModalHeader
Modal.Body = ModalBody
Modal.Footer = ModalFooter
Modal.Title = ModalTitle
Modal.Description = ModalDescription
Modal.Close = ModalClose