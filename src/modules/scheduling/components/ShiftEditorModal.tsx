/**
 * Shift Editor Modal - Create/Edit shift dialog
 * ARCHITECTURE: Material Form Pattern
 * - Uses ShiftForm component (presentational)
 * - ShiftForm uses useShiftForm hook (business logic)
 * - Clean separation of concerns
 */

import {
  Dialog,
  Button,
  Icon,
  HStack,
  Text,
  VStack,
  Flex
} from '@/shared/ui';
import { PencilSquareIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { ShiftForm } from './ShiftForm';
import { useShiftForm } from '../hooks/useShiftForm';
import type { Shift } from '../../types/schedulingTypes';

interface ShiftEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  shift?: Shift | null;
  prefilledDate?: string;
  prefilledEmployee?: string;
}

export function ShiftEditorModal({
  isOpen,
  onClose,
  onSuccess,
  shift,
  prefilledDate,
  prefilledEmployee,
}: ShiftEditorModalProps) {
  const isEditMode = !!shift;

  // Get form business logic from hook
  const {
    isSubmitting,
    validationState,
    submitButtonContent,
    handleSubmit,
    onClose: closeModal
  } = useShiftForm({
    isOpen,
    onClose,
    onSuccess,
    shift,
    prefilledDate,
    prefilledEmployee
  });

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => !details.open && !isSubmitting && closeModal()}
      size={{ base: "full", md: "xl" }}
      closeOnEscape={!isSubmitting}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content
          maxW={{ base: "100%", md: "900px" }}
          maxH={{ base: "100vh", md: "90vh" }}
          w="full"
          overflowY="auto"
          borderRadius={{ base: "0", md: "lg" }}
          m={{ base: "0", md: "4" }}
        >
          <Dialog.CloseTrigger />
          <Dialog.Header>
            <HStack>
              <Icon
                icon={isEditMode ? PencilSquareIcon : PlusCircleIcon}
                size="lg"
                className="text-gray-500"
              />
              <VStack align="start" gap="0">
                <Dialog.Title>{isEditMode ? 'Editar Turno' : 'Nuevo Turno'}</Dialog.Title>
                <Text fontSize="sm" color="gray.500">
                  {isEditMode
                    ? 'Actualiza los detalles de este turno.'
                    : 'Completa el formulario para agregar un nuevo turno.'}
                </Text>
              </VStack>
            </HStack>
          </Dialog.Header>

          <Dialog.Body p={{ base: "4", md: "6" }}>
            <ShiftForm
              isOpen={isOpen}
              onClose={closeModal}
              onSuccess={onSuccess}
              shift={shift}
              prefilledDate={prefilledDate}
              prefilledEmployee={prefilledEmployee}
            />
          </Dialog.Body>

          <Dialog.Footer>
            <Flex
              gap="3"
              pt="4"
              justify={{ base: "stretch", md: "flex-end" }}
              direction={{ base: "column-reverse", md: "row" }}
              borderTop="1px solid"
              borderColor="border"
            >
              <Button
                variant="outline"
                onClick={closeModal}
                disabled={isSubmitting}
                height="44px"
                fontSize="md"
                px="6"
                w={{ base: "full", md: "auto" }}
              >
                Cancelar
              </Button>

              <Button
                colorPalette={isSubmitting ? "gray" : "blue"}
                onClick={handleSubmit}
                disabled={validationState.hasErrors || isSubmitting}
                height="44px"
                fontSize="md"
                px="6"
                w={{ base: "full", md: "auto" }}
              >
                {submitButtonContent}
              </Button>
            </Flex>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}