import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Stack, Box, Progress } from '@/shared/ui';
import { ServiceSelection } from './components/ServiceSelection';
import { ProfessionalSelection } from './components/ProfessionalSelection';
import { CalendarPicker } from './components/CalendarPicker';
import { BookingConfirmation } from './components/BookingConfirmation';
import { useCreateAppointment } from './hooks/useBooking';
import type { BookingStep, ServiceProduct, ProfessionalProfile, AvailableSlotInfo } from '@/types/appointment';

export default function BookingPage() {
  const navigate = useNavigate();
  const createAppointment = useCreateAppointment();

  // Booking state
  const [step, setStep] = useState<BookingStep>('service');
  const [selectedService, setSelectedService] = useState<ServiceProduct | undefined>();
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalProfile | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlotInfo | undefined>();
  const [notes, setNotes] = useState('');

  // Calculate progress (1-4 steps)
  const stepNumbers = { service: 1, professional: 2, time: 3, confirm: 4 };
  const currentStepNumber = stepNumbers[step];
  const progress = (currentStepNumber / 4) * 100;

  // Handlers
  const handleServiceSelect = (service: ServiceProduct) => {
    setSelectedService(service);

    // Check if service requires specific professional
    if (service.requires_specific_professional) {
      setStep('professional');
    } else {
      setStep('time'); // Skip professional selection
    }
  };

  const handleProfessionalSelect = (professional: ProfessionalProfile) => {
    setSelectedProfessional(professional);
    setStep('time');
  };

  const handleProfessionalSkip = () => {
    setSelectedProfessional(undefined);
    setStep('time');
  };

  const handleSlotSelect = (slot: AvailableSlotInfo) => {
    setSelectedSlot(slot);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!selectedService || !selectedSlot) return;

    // TODO: Get real customer ID from auth context
    const customerId = 'temp-customer-id'; // Replace with real auth

    const scheduledTime = `${selectedSlot.date}T${selectedSlot.start_time}:00`;

    await createAppointment.mutateAsync({
      service_id: selectedService.id,
      staff_id: selectedProfessional?.id,
      scheduled_time: scheduledTime,
      customer_id: customerId,
      notes: notes || undefined,
    });

    // Navigate to appointments list
    navigate('/app/appointments');
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('time');
    } else if (step === 'time') {
      if (selectedService?.requires_specific_professional) {
        setStep('professional');
      } else {
        setStep('service');
      }
    } else if (step === 'professional') {
      setStep('service');
    }
  };

  return (
    <Container maxW="4xl" py="8">
      <Stack gap="6">
        {/* Progress Bar */}
        <Box>
          <Progress
            value={progress}
            colorPalette="blue"
            size="sm"
            borderRadius="full"
          />
        </Box>

        {/* Step Content */}
        {step === 'service' && (
          <ServiceSelection onSelect={handleServiceSelect} />
        )}

        {step === 'professional' && selectedService && (
          <ProfessionalSelection
            serviceId={selectedService.id}
            onSelect={handleProfessionalSelect}
            onSkip={handleProfessionalSkip}
          />
        )}

        {step === 'time' && selectedService && (
          <CalendarPicker
            serviceId={selectedService.id}
            staffId={selectedProfessional?.id}
            onSelect={handleSlotSelect}
          />
        )}

        {step === 'confirm' && selectedService && selectedSlot && (
          <BookingConfirmation
            service={selectedService}
            professional={selectedProfessional}
            slot={selectedSlot}
            notes={notes}
            onNotesChange={setNotes}
            onConfirm={handleConfirm}
            onBack={handleBack}
            isLoading={createAppointment.isPending}
          />
        )}
      </Stack>
    </Container>
  );
}
