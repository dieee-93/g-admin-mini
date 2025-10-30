import {
  Dialog,
  Button,
  Icon,
  HStack,
  Text,
  VStack
} from '@/shared/ui';
import { PencilSquareIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { SchedulingFormEnhanced } from './SchedulingFormEnhanced';
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

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) {
          onClose();
        }
      }}
      size={{ base: "full", md: "xl" }}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content
          maxW={{ base: "100%", md: "900px" }}
          maxH={{ base: "100vh", md: "90vh" }}
          w="full"
          overflowY="auto"
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
                <Dialog.Title>{isEditMode ? 'Edit Shift' : 'Create New Shift'}</Dialog.Title>
                <Text fontSize="sm" color="gray.500">
                  {isEditMode
                    ? 'Update the details for this shift.'
                    : 'Fill out the form to add a new shift to the schedule.'}
                </Text>
              </VStack>
            </HStack>
          </Dialog.Header>
          <Dialog.Body>
            <SchedulingFormEnhanced
              schedule={shift}
              onSuccess={() => {
                onSuccess();
                onClose();
              }}
              onCancel={onClose}
              prefilledDate={prefilledDate}
              prefilledEmployee={prefilledEmployee}
            />
          </Dialog.Body>
          <Dialog.Footer>
            <HStack justify="end" w="full">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}