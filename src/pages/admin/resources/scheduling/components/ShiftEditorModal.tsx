import {
  Modal,
  Button,
  Icon,
  HStack,
  Text,
  VStack,
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
    <Modal.Root isOpen={isOpen} onOpenChange={() => onClose()} size="2xl">
      <Modal.Backdrop />
      <Modal.Content>
        <Modal.Header>
          <HStack>
            <Icon
              icon={isEditMode ? PencilSquareIcon : PlusCircleIcon}
              size="lg"
              className="text-gray-500"
            />
            <VStack align="start" gap="0">
              <Modal.Title>{isEditMode ? 'Edit Shift' : 'Create New Shift'}</Modal.Title>
              <Text fontSize="sm" color="gray.500">
                {isEditMode
                  ? 'Update the details for this shift.'
                  : 'Fill out the form to add a new shift to the schedule.'}
              </Text>
            </VStack>
          </HStack>
        </Modal.Header>
        <Modal.Body>
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
        </Modal.Body>
        <Modal.Footer>
            <HStack justify="end" w="full">
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
            </HStack>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}