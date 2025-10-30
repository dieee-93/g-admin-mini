import React from 'react';
import { CardWrapper, Typography, Stack } from '@/shared/ui';

export function ReservationsList() {
  return (
    <CardWrapper>
      <Stack direction="column" align="center" gap="md" p="xl">
        <Typography size="lg" color="text.muted">
          📅 Reservation Management
        </Typography>
        <Typography size="sm" color="text.muted" textAlign="center">
          Reservation management interface will be implemented here.
          <br />
          Features: Create reservations, view upcoming bookings, manage waitlist.
        </Typography>
      </Stack>
    </CardWrapper>
  );
}
