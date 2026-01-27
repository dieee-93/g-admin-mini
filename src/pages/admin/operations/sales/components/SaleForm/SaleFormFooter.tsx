import {
  Dialog,
  Button,
  Flex,
  Icon,
} from '@/shared/ui';
import { TrashIcon } from '@heroicons/react/24/outline';

interface SaleFormFooterProps {
  onClose: () => void;
  isProcessing: boolean;
  cartLength: number;
  onClearCart: () => void;
  onOpenPaymentConfirmation: () => void;
  submitButtonContent: React.ReactNode;
  hasValidationErrors: boolean;
}

export function SaleFormFooter({
  onClose,
  isProcessing,
  cartLength,
  onClearCart,
  onOpenPaymentConfirmation,
  submitButtonContent,
  hasValidationErrors
}: SaleFormFooterProps) {
  return (
    <Dialog.Footer>
      <Flex
        gap="3"
        pt="4"
        justify="space-between"
        width="full"
        borderTop="1px solid"
        borderColor="border"
      >
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isProcessing}
          size="lg"
        >
          Cancelar
        </Button>

        <Flex gap="3">
          {cartLength > 0 && (
            <Button
              variant="outline"
              onClick={onClearCart}
              disabled={isProcessing}
              colorPalette="red"
              size="lg"
            >
              <Icon icon={TrashIcon} />
              Vaciar
            </Button>
          )}

          <Button
            variant="solid"
            colorPalette={isProcessing ? "gray" : "blue"}
            onClick={onOpenPaymentConfirmation}
            disabled={cartLength === 0 || isProcessing || hasValidationErrors}
            size="lg"
          >
            {submitButtonContent}
          </Button>
        </Flex>
      </Flex>
    </Dialog.Footer>
  );
}
