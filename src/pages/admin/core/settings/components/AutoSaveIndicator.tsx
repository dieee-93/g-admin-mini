// 💫 COMPONENTE VISUAL DE AUTO-SAVE G-ADMIN v2.1
// Indicador de estado de guardado automático con animaciones
import { Box, HStack, Spinner } from '@/shared/ui';
import { CheckIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  hasUnsavedChanges: boolean;
  error?: string;
  onRetry?: () => void;
}

const StatusIcon = ({ status }: { status: AutoSaveIndicatorProps['status'] }) => {
  switch (status) {
    case 'saving':
      return <Spinner size="sm" color="blue.500" />;
    case 'saved':
      return <CheckIcon className="w-4 h-4 text-green-500" />;
    case 'error':
      return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
    case 'idle':
    default:
      return <ClockIcon className="w-4 h-4 text-gray-400" />;
  }
};

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);

  if (diffSecs < 60) return 'hace unos segundos';
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  return date.toLocaleDateString();
};

export const AutoSaveIndicator = ({
  status,
  lastSaved,
  hasUnsavedChanges,
  error,
  onRetry
}: AutoSaveIndicatorProps) => {
  const getStatusText = () => {
    switch (status) {
      case 'saving':
        return 'Guardando...';
      case 'saved':
        return lastSaved ? `Guardado ${formatRelativeTime(lastSaved)}` : 'Guardado';
      case 'error':
        return error || 'Error al guardar';
      case 'idle':
      default:
        return hasUnsavedChanges ? 'Cambios pendientes' : 'Sin cambios';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'saving':
        return 'blue.500';
      case 'saved':
        return 'green.500';
      case 'error':
        return 'red.500';
      case 'idle':
      default:
        return hasUnsavedChanges ? 'orange.500' : 'gray.500';
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
      >
        <HStack gap="2" alignItems="center">
          <StatusIcon status={status} />
          
          <Box
            as="span"
            fontSize="sm"
            color={getStatusColor()}
            fontWeight={status === 'saving' ? 'medium' : 'normal'}
          >
            {getStatusText()}
          </Box>

          {status === 'error' && onRetry && (
            <Box
              as="button"
              onClick={onRetry}
              color="red.500"
              fontSize="sm"
              textDecoration="underline"
              _hover={{ color: 'red.600' }}
              ml="2"
            >
              Reintentar
            </Box>
          )}
        </HStack>
      </motion.div>
    </AnimatePresence>
  );
};

// 🎯 Componente compacto para la barra superior
export const AutoSaveStatusBadge = ({
  status,
  hasUnsavedChanges
}: Pick<AutoSaveIndicatorProps, 'status' | 'hasUnsavedChanges'>) => {
  if (status === 'idle' && !hasUnsavedChanges) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Box
        px="2"
        py="1"
        borderRadius="full"
        fontSize="xs"
        fontWeight="medium"
        bg={
          status === 'saving' ? 'blue.100' :
          status === 'saved' ? 'green.100' :
          status === 'error' ? 'red.100' :
          'orange.100'
        }
        color={
          status === 'saving' ? 'blue.700' :
          status === 'saved' ? 'green.700' :
          status === 'error' ? 'red.700' :
          'orange.700'
        }
        display="flex"
        alignItems="center"
        gap="1"
      >
        <StatusIcon status={status} />
        {status === 'saving' && 'Guardando'}
        {status === 'saved' && 'Guardado'}
        {status === 'error' && 'Error'}
        {status === 'idle' && hasUnsavedChanges && 'Pendiente'}
      </Box>
    </motion.div>
  );
};