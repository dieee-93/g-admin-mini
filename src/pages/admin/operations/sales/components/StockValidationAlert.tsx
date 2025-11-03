// components/StockValidationAlert.tsx
import { 
  Alert,
  Stack,
  Typography,
  Badge
} from '@/shared/ui';
import { type StockValidationResult } from '@/hooks/useSaleStockValidation';

interface StockValidationAlertProps {
  validationResult: StockValidationResult;
  isLoading?: boolean;
}

export function StockValidationAlert({ validationResult, isLoading }: StockValidationAlertProps) {
  if (isLoading) {
    return (
      <Alert status="info">
        <Typography variant="body" size="sm" weight="medium">
          Verificando stock...
        </Typography>
      </Alert>
    );
  }

  if (validationResult.is_valid) {
    return (
      <Alert status="success">
        <Stack gap="xs">
          <Typography variant="body" size="sm" weight="semibold">
            Stock disponible
          </Typography>
          <Typography variant="body" size="xs" color="text.secondary">
            Todos los productos tienen stock suficiente para esta venta.
          </Typography>
        </Stack>
      </Alert>
    );
  }

  return (
    <Stack gap="sm">
      <Alert status="error">
        <Stack gap="xs">
          <Typography variant="body" size="sm" weight="semibold">
            Stock insuficiente
          </Typography>
          {validationResult.error_message && (
            <Typography variant="body" size="xs" color="text.secondary">
              {validationResult.error_message}
            </Typography>
          )}
        </Stack>
      </Alert>

      {validationResult.insufficient_items && validationResult.insufficient_items.length > 0 && (
        <div style={{
          marginTop: '0.75rem',
          padding: '0.75rem',
          backgroundColor: 'var(--colors-error-bg)',
          borderRadius: '0.375rem',
          border: '1px solid var(--colors-error-border)'
        }}>
          <Typography variant="body" size="sm" weight="medium" color="error" style={{marginBottom: '0.5rem'}}>
            Productos con stock insuficiente:
          </Typography>
          <Stack gap="sm" align="start">
            {validationResult.insufficient_items.map((item) => (
              <Stack 
                key={item.product_id} 
                direction="row"
                justify="space-between" 
                align="center"
                gap="sm"
              >
                <div style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: 'white',
                  borderRadius: '0.25rem',
                  border: '1px solid var(--colors-error-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Stack gap="xs" align="start">
                    <Typography variant="body" size="sm" weight="medium" color="error">
                      {item.product_name}
                    </Typography>
                    <Typography variant="body" size="xs" color="text.secondary">
                      Necesitas {item.required}, disponible: {item.available}
                    </Typography>
                  </Stack>
                  <Badge colorPalette="red" size="sm">
                    Faltan {item.missing}
                  </Badge>
                </div>
              </Stack>
            ))}
          </Stack>
        </div>
      )}
    </Stack>
  );
}