/**
 * ValidationBlockersUI - Muestra blockers de validación
 * @version 2.1 - Simplified stub
 */

import { Alert, Text, Button, Stack } from '@/shared/ui';
import type { CloseValidationResult } from '../types';

interface ValidationBlockersUIProps {
  validationResult: CloseValidationResult;
  onResolve: () => void;
}

export function ValidationBlockersUI({ validationResult, onResolve }: ValidationBlockersUIProps) {
  return (
    <Stack gap={2}>
      <Alert status="warning">
        <Text fontWeight="bold">No se puede cerrar el turno</Text>
      </Alert>

      {validationResult.blockers.map((blocker, idx) => (
        <Alert key={idx} status="error">
          <Text>{blocker.message}</Text>
        </Alert>
      ))}

      <Button onClick={onResolve} size="sm">
        Entendido
      </Button>
    </Stack>
  );
}
