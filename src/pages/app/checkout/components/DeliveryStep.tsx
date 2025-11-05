import { useState, useEffect } from 'react';
import { Stack, Text, Button, RadioGroup, Alert, Spinner } from '@/shared/ui';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CustomerAddress {
  id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state_province?: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
}

interface DeliveryStepProps {
  selectedAddressId: string | null;
  onAddressSelect: (addressId: string) => void;
  onNext: () => void;
}

export function DeliveryStep({
  selectedAddressId,
  onAddressSelect,
  onNext,
}: DeliveryStepProps) {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) {
      setError('Please log in to continue');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setAddresses(data || []);

      // Auto-select default address
      const defaultAddress = data?.find((addr) => addr.is_default);
      if (defaultAddress && !selectedAddressId) {
        onAddressSelect(defaultAddress.id);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: CustomerAddress) => {
    const parts = [
      address.address_line1,
      address.address_line2,
      address.city,
      address.state_province,
      address.postal_code,
      address.country,
    ].filter(Boolean);

    return parts.join(', ');
  };

  if (loading) {
    return (
      <Stack py="10" align="center">
        <Spinner size="lg" colorPalette="blue" />
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Icon />
        <Stack gap="1">
          <Alert.Title>Error loading addresses</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Stack>
      </Alert.Root>
    );
  }

  if (addresses.length === 0) {
    return (
      <Stack gap="6">
        <Alert.Root status="warning">
          <Alert.Icon />
          <Stack gap="1">
            <Alert.Title>No delivery addresses</Alert.Title>
            <Alert.Description>
              You need to add a delivery address before proceeding with checkout.
            </Alert.Description>
          </Stack>
        </Alert.Root>

        <Text color="gray.600">
          Please contact support or add an address in your profile settings.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="6">
      <Stack gap="2">
        <Text fontSize="xl" fontWeight="bold">
          Select Delivery Address
        </Text>
        <Text color="gray.600">
          Choose where you'd like your order delivered
        </Text>
      </Stack>

      <RadioGroup.Root
        value={selectedAddressId || ''}
        onValueChange={(e) => onAddressSelect(e.value)}
      >
        <Stack gap="3">
          {addresses.map((address) => (
            <RadioGroup.Item
              key={address.id}
              value={address.id}
              p="4"
              borderWidth="1px"
              borderRadius="md"
              cursor="pointer"
              _hover={{ borderColor: 'blue.500' }}
            >
              <Stack direction="row" gap="3" align="flex-start">
                <RadioGroup.ItemControl />
                <Stack gap="1" flex="1">
                  <RadioGroup.ItemText fontWeight="medium">
                    {formatAddress(address)}
                  </RadioGroup.ItemText>
                  {address.is_default && (
                    <Text fontSize="sm" color="blue.600">
                      Default Address
                    </Text>
                  )}
                </Stack>
              </Stack>
            </RadioGroup.Item>
          ))}
        </Stack>
      </RadioGroup.Root>

      <Button
        colorPalette="blue"
        size="lg"
        onClick={onNext}
        disabled={!selectedAddressId}
      >
        Continue to Review
      </Button>
    </Stack>
  );
}
