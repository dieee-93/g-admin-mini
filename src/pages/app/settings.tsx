// CustomerSettings.tsx - Configuración personal limitada para usuarios CLIENTE
// Solo configuraciones que corresponden al cliente, NO configuraciones de administración

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Switch,
  Tabs,
  Avatar,
  Badge,
  Grid,
  CardWrapper,
  Button,
  Icon,
  InputField
} from '@/shared/ui';
import {
  UserIcon,
  BellIcon,
  MapPinIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  KeyIcon,
  StarIcon,
  GiftIcon
} from '@heroicons/react/24/outline';

// Componente de sección del perfil
function ProfileSection() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: 'Cliente Test',
    email: 'clientetest@example.com',
    phone: '+1 234 567 8900',
    birthday: '1990-01-15'
  });

  return (
    <CardWrapper variant="elevated">
      <CardWrapper>
        <VStack align="stretch" gap="6">
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Información Personal
            </Text>
            <Button
              variant={isEditing ? "solid" : "outline"}
              size="sm"
              colorPalette={isEditing ? "green" : "blue"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Guardar' : 'Editar'}
            </Button>
          </HStack>
          
          {/* Avatar y nombre principal */}
          <HStack gap="4" align="center">
            <Avatar size="xl" name={profileData.fullName} />
            <VStack align="start" gap="1">
              <Text fontSize="xl" fontWeight="bold">
                {profileData.fullName}
              </Text>
              <Badge colorPalette="blue" variant="subtle">
                Cliente
              </Badge>
              <Text fontSize="sm" color="text.secondary">
                Miembro desde Enero 2024
              </Text>
            </VStack>
          </HStack>
          
          {/* Formulario */}
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap="4">
            <VStack align="start" gap="2">
              <Text fontSize="sm" fontWeight="medium">
                Nombre Completo
              </Text>
              <InputField
                value={profileData.fullName}
                isReadOnly={!isEditing}
                onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
              />
            </VStack>
            
            <VStack align="start" gap="2">
              <Text fontSize="sm" fontWeight="medium">
                Email
              </Text>
              <InputField
                type="email"
                value={profileData.email}
                disabled={!isEditing}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              />
            </VStack>
            
            <VStack align="start" gap="2">
              <Text fontSize="sm" fontWeight="medium">
                Teléfono
              </Text>
              <InputField
                type="tel"
                value={profileData.phone}
                disabled={!isEditing}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </VStack>
            
            <VStack align="start" gap="2">
              <Text fontSize="sm" fontWeight="medium">
                Fecha de Nacimiento
              </Text>
              <InputField
                type="date"
                value={profileData.birthday}
                isReadOnly={!isEditing}
                onChange={(e) => setProfileData(prev => ({ ...prev, birthday: e.target.value }))}
              />
            </VStack>
          </Grid>
        </VStack>
      </CardWrapper>
    </CardWrapper>
  );
}

// Componente de preferencias de notificaciones
function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    smsNotifications: true,
    emailNotifications: true
  });

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const notificationOptions = [
    {
      key: 'orderUpdates' as keyof typeof preferences,
      title: 'Actualizaciones de Pedidos',
      description: 'Estado de tus pedidos y tiempo de entrega'
    },
    {
      key: 'promotions' as keyof typeof preferences,
      title: 'Promociones y Ofertas',
      description: 'Descuentos especiales y ofertas personalizadas'
    },
    {
      key: 'newsletter' as keyof typeof preferences,
      title: 'Newsletter',
      description: 'Noticias y novedades del menú'
    },
    {
      key: 'smsNotifications' as keyof typeof preferences,
      title: 'Notificaciones SMS',
      description: 'Recibir notificaciones por mensaje de texto'
    },
    {
      key: 'emailNotifications' as keyof typeof preferences,
      title: 'Notificaciones Email',
      description: 'Recibir notificaciones por correo electrónico'
    }
  ];

  return (
    <CardWrapper variant="elevated">
      <CardWrapper.Body>
        <VStack align="stretch" gap="4">
          <Text fontSize="lg" fontWeight="semibold">
            Preferencias de Notificación
          </Text>
          
          {notificationOptions.map((option) => (
            <HStack key={option.key} justify="space-between" align="center" py="2">
              <VStack align="start" gap="1" flex="1">
                <Text fontSize="md" fontWeight="medium">
                  {option.title}
                </Text>
                <Text fontSize="sm" color="text.secondary">
                  {option.description}
                </Text>
              </VStack>
              <Switch
                checked={preferences[option.key]}
                onCheckedChange={() => togglePreference(option.key)}
                colorPalette="blue"
              >
                {option.title}
              </Switch>
            </HStack>
          ))}
        </VStack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}

// Componente de direcciones
function AddressesSection() {
  const addresses = [
    {
      id: '1',
      title: 'Casa',
      address: 'Av. Principal 123, Apt 4B',
      city: 'Ciudad, Provincia',
      isDefault: true
    },
    {
      id: '2', 
      title: 'Trabajo',
      address: 'Calle Comercial 456, Oficina 789',
      city: 'Ciudad, Provincia',
      isDefault: false
    }
  ];

  return (
    <CardWrapper variant="elevated">
      <CardWrapper.Body>
        <VStack align="stretch" gap="4">
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Direcciones de Entrega
            </Text>
            <Button leftIcon={<Icon icon={MapPinIcon} size="sm" />} size="sm" variant="outline">
              Agregar Dirección
            </Button>
          </HStack>
          
          <VStack align="stretch" gap="3">
            {addresses.map((address) => (
              <CardWrapper key={address.id} variant="outline" size="sm">
                <CardWrapper>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" gap="1">
                      <HStack gap="2" align="center">
                        <Text fontSize="md" fontWeight="medium">
                          {address.title}
                        </Text>
                        {address.isDefault && (
                          <Badge colorPalette="green" variant="subtle" size="sm">
                            Predeterminada
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="sm" color="text.secondary">
                        {address.address}
                      </Text>
                      <Text fontSize="sm" color="text.muted">
                        {address.city}
                      </Text>
                    </VStack>
                    <HStack gap="1">
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                      {!address.isDefault && (
                        <Button variant="ghost" size="sm" color="red.500">
                          Eliminar
                        </Button>
                      )}
                    </HStack>
                  </HStack>
                </CardWrapper>
              </CardWrapper>
            ))}
          </VStack>
        </VStack>
      </CardWrapper>
    </CardWrapper>
  );
}

// Componente de métodos de pago
function PaymentMethods() {
  const paymentMethods = [
    {
      id: '1',
      type: 'card',
      title: 'Visa **** 1234',
      expiry: '12/26',
      isDefault: true
    },
    {
      id: '2',
      type: 'card', 
      title: 'Mastercard **** 5678',
      expiry: '08/25',
      isDefault: false
    }
  ];

  return (
    <CardWrapper variant="elevated">
      <CardBody>
        <VStack align="stretch" gap="4">
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Métodos de Pago
            </Text>
            <Button leftIcon={<Icon icon={CreditCardIcon} size="sm" />} size="sm" variant="outline">
              Agregar Tarjeta
            </Button>
          </HStack>
          
          <VStack align="stretch" gap="3">
            {paymentMethods.map((method) => (
              <CardWrapper key={method.id} variant="outline" size="sm">
                <CardBody>
                  <HStack justify="space-between" align="center">
                    <HStack gap="3" align="center">
                      <Box p="2" bg="blue.50" borderRadius="md">
                        <Icon icon={CreditCardIcon} size="md" color="blue.600" />
                      </Box>
                      <VStack align="start" gap="1">
                        <HStack gap="2" align="center">
                          <Text fontSize="md" fontWeight="medium">
                            {method.title}
                          </Text>
                          {method.isDefault && (
                            <Badge colorPalette="green" variant="subtle" size="sm">
                              Predeterminada
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="sm" color="text.muted">
                          Vence {method.expiry}
                        </Text>
                      </VStack>
                    </HStack>
                    <HStack gap="1">
                      <Button variant="ghost" size="sm">
                        Editar
                      </Button>
                      {!method.isDefault && (
                        <Button variant="ghost" size="sm" color="red.500">
                          Eliminar
                        </Button>
                      )}
                    </HStack>
                  </HStack>
                </CardBody>
              </CardWrapper>
            ))}
          </VStack>
        </VStack>
      </CardBody>
    </CardWrapper>
  );
}

// Componente de seguridad
function SecuritySection() {
  return (
    <CardWrapper variant="elevated">
      <CardBody>
        <VStack align="stretch" gap="4">
          <Text fontSize="lg" fontWeight="semibold">
            Seguridad
          </Text>
          
          <VStack align="stretch" gap="3">
            <HStack justify="space-between" align="center" py="2">
              <HStack gap="3" align="center">
                <Icon icon={KeyIcon} size="md" color="blue.600" />
                <VStack align="start" gap="0">
                  <Text fontSize="md" fontWeight="medium">
                    Cambiar Contraseña
                  </Text>
                  <Text fontSize="sm" color="text.secondary">
                    Actualiza tu contraseña regularmente
                  </Text>
                </VStack>
              </HStack>
              <Button variant="outline" size="sm">
                Cambiar
              </Button>
            </HStack>
            
            <HStack justify="space-between" align="center" py="2">
              <HStack gap="3" align="center">
                <Icon icon={ShieldCheckIcon} size="md" color="green.600" />
                <VStack align="start" gap="0">
                  <Text fontSize="md" fontWeight="medium">
                    Autenticación de 2 Factores
                  </Text>
                  <Text fontSize="sm" color="text.secondary">
                    Agregar una capa extra de seguridad
                  </Text>
                </VStack>
              </HStack>
              <Switch colorPalette="green" />
            </HStack>
          </VStack>
        </VStack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}

// Componente de programa de lealtad
function LoyaltyProgram() {
  return (
    <CardWrapper variant="elevated" bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" color="white">
      <CardWrapper.Body>
        <VStack align="stretch" gap="4">
          <HStack gap="3" align="center">
            <Icon icon={StarIcon} size="lg" />
            <Text fontSize="lg" fontWeight="semibold">
              Programa de Lealtad
            </Text>
          </HStack>
          
          <Grid templateColumns="repeat(3, 1fr)" gap="4">
            <VStack gap="1">
              <Text fontSize="2xl" fontWeight="bold">
                245
              </Text>
              <Text fontSize="sm" opacity={0.9}>
                Puntos
              </Text>
            </VStack>
            <VStack gap="1">
              <Text fontSize="2xl" fontWeight="bold">
                Gold
              </Text>
              <Text fontSize="sm" opacity={0.9}>
                Nivel
              </Text>
            </VStack>
            <VStack gap="1">
              <Text fontSize="2xl" fontWeight="bold">
                55
              </Text>
              <Text fontSize="sm" opacity={0.9}>
                Para Premio
              </Text>
            </VStack>
          </Grid>
          
          <Button
            leftIcon={<Icon icon={GiftIcon} size="sm" />}
            bg="white"
            color="purple.600"
            _hover={{ bg: "gray.50" }}
          >
            Ver Recompensas
          </Button>
        </VStack>
      </CardBody>
    </CardWrapper>
  );
}

export function CustomerSettings() {
  const [selectedTab, setSelectedTab] = useState('profile');

  return (
    <Box p={{ base: "4", md: "6" }} maxW="1200px" mx="auto">
      <VStack align="stretch" gap="8">
        {/* Header */}
        <VStack align="start" gap="2">
          <Text fontSize="3xl" fontWeight="bold" color="text.primary">
            Mi Perfil
          </Text>
          <Text fontSize="lg" color="text.secondary">
            Administra tu información personal y preferencias
          </Text>
        </VStack>
        
        {/* Programa de lealtad destacado */}
        <LoyaltyProgram />
        
        {/* Tabs */}
        <Tabs.Root value={selectedTab} onValueChange={(e) => setSelectedTab(e.value as string)}>
          <Tabs.List bg="bg.surface" borderRadius="xl" p="1">
            <Tabs.Trigger value="profile" flex="1" borderRadius="lg">
              <HStack gap="2" align="center">
                <Icon icon={UserIcon} size="sm" />
                <Text fontSize="sm" fontWeight="medium">Perfil</Text>
              </HStack>
            </Tabs.Trigger>
            <Tabs.Trigger value="notifications" flex="1" borderRadius="lg">
              <HStack gap="2" align="center">
                <Icon icon={BellIcon} size="sm" />
                <Text fontSize="sm" fontWeight="medium">Notificaciones</Text>
              </HStack>
            </Tabs.Trigger>
            <Tabs.Trigger value="addresses" flex="1" borderRadius="lg">
              <HStack gap="2" align="center">
                <Icon icon={MapPinIcon} size="sm" />
                <Text fontSize="sm" fontWeight="medium">Direcciones</Text>
              </HStack>
            </Tabs.Trigger>
            <Tabs.Trigger value="payment" flex="1" borderRadius="lg">
              <HStack gap="2" align="center">
                <Icon icon={CreditCardIcon} size="sm" />
                <Text fontSize="sm" fontWeight="medium">Pagos</Text>
              </HStack>
            </Tabs.Trigger>
            <Tabs.Trigger value="security" flex="1" borderRadius="lg">
              <HStack gap="2" align="center">
                <Icon icon={ShieldCheckIcon} size="sm" />
                <Text fontSize="sm" fontWeight="medium">Seguridad</Text>
              </HStack>
            </Tabs.Trigger>
          </Tabs.List>
          
          <Box mt="6">
            <Tabs.Content value="profile">
              <ProfileSection />
            </Tabs.Content>
            <Tabs.Content value="notifications">
              <NotificationPreferences />
            </Tabs.Content>
            <Tabs.Content value="addresses">
              <AddressesSection />
            </Tabs.Content>
            <Tabs.Content value="payment">
              <PaymentMethods />
            </Tabs.Content>
            <Tabs.Content value="security">
              <SecuritySection />
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}

export default CustomerSettings;