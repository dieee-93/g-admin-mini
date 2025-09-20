// InvoiceGeneration.tsx - Migrated to Design System
import { useState, useEffect } from 'react';

// DESIGN SYSTEM IMPORTS
import {
  // Layout & Structure
  Stack,
  VStack,
  HStack,
  SimpleGrid,
  
  // Typography
  Typography,
  
  // Components
  CardWrapper ,
  Button,
  Badge,
  
  // Form Components
  InputField,
  NumberField,
  SelectField,
  
  // Advanced
  Alert,
  AlertDescription,
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalClose
} from '@/shared/ui';

// Icons
import {
  DocumentPlusIcon,
  PrinterIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Fiscal imports
import { fiscalApi } from '../../services';
import { notify } from '@/lib/notifications';
import { type Invoice, type InvoiceType, type CondicionIVA } from '../../types';

interface InvoiceGenerationProps {
  // Optional mode prop for future use
  mode?: 'online' | 'offline' | 'hybrid';
}

export function InvoiceGeneration({ mode = 'hybrid' }: InvoiceGenerationProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state for new invoice
  const [formData, setFormData] = useState({
    tipo_comprobante: '006' as InvoiceType, // Factura B por defecto
    denominacion_cliente: '',
    cuit_cliente: '',
    condicion_iva_cliente: '05' as CondicionIVA, // Consumidor Final por defecto
    items: [
      {
        descripcion: '',
        cantidad: 1,
        precio_unitario: 0,
        alicuota_iva: '005' // 21%
      }
    ]
  });

  // Load invoices
  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const data = await fiscalApi.getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
      notify.error({
        title: 'Error',
        description: 'No se pudieron cargar las facturas'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      setIsCreating(true);
      
      // Calculate totals
      const subtotal = formData.items.reduce((sum, item) => 
        sum + (item.cantidad * item.precio_unitario), 0
      );
      
      const iva_21 = subtotal * 0.21;
      const total = subtotal + iva_21;

      const invoiceData = {
        ...formData,
        subtotal,
        iva_21,
        total,
        items: formData.items.map(item => ({
          ...item,
          unidad_medida: '07' as any, // Unidades
          bonificacion: 0,
          alicuota_iva: '005' as any, // 21%
          importe_iva: item.cantidad * item.precio_unitario * 0.21,
          importe_neto: item.cantidad * item.precio_unitario
        }))
      };

      await fiscalApi.createInvoice(invoiceData);
      
      notify.success({
        title: 'Factura Creada',
        description: 'La factura se generó correctamente'
      });

      setShowCreateModal(false);
      resetForm();
      loadInvoices();
      
    } catch (error) {
      console.error('Error creating invoice:', error);
      notify.error({
        title: 'Error',
        description: 'No se pudo crear la factura'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tipo_comprobante: '006' as InvoiceType,
      denominacion_cliente: '',
      cuit_cliente: '',
      condicion_iva_cliente: '05' as CondicionIVA,
      items: [{
        descripcion: '',
        cantidad: 1,
        precio_unitario: 0,
        alicuota_iva: '005'
      }]
    });
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        descripcion: '',
        cantidad: 1,
        precio_unitario: 0,
        alicuota_iva: '005'
      }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const getStatusBadge = (invoice: Invoice) => {
    if (invoice.cae) {
      return <Badge colorPalette="green">Aprobada</Badge>;
    } else if (invoice.resultado === 'R') {
      return <Badge colorPalette="red">Rechazada</Badge>;
    } else {
      return <Badge colorPalette="orange">Pendiente</Badge>;
    }
  };

  return (
    <VStack gap="lg" align="stretch">
      {/* Header */}
      <HStack justify="space-between" align="center">
        <VStack gap="xs" align="start">
          <Typography variant="heading">Generación de Facturas</Typography>
          <Typography variant="body" color="text.muted">
            Crear y gestionar facturas electrónicas - Modo: {mode}
          </Typography>
        </VStack>

        <Modal>
          <ModalTrigger asChild>
            <Button 
              colorPalette="green"
              size="lg"
              onClick={() => setShowCreateModal(true)}
            >
              <DocumentPlusIcon className="w-5 h-5" />
              Nueva Factura
            </Button>
          </ModalTrigger>

          <ModalContent>
            <ModalHeader>
              <ModalTitle>Crear Nueva Factura</ModalTitle>
            </ModalHeader>

            <ModalBody>
              <VStack gap="md" align="stretch">
                {/* Tipo de Comprobante */}
                <SelectField
                  label="Tipo de Comprobante"
                  options={[
                    { value: '001', label: 'Factura A' },
                    { value: '006', label: 'Factura B' },
                    { value: '011', label: 'Factura C' },
                    { value: '002', label: 'Nota Crédito A' },
                    { value: '007', label: 'Nota Crédito B' },
                    { value: '012', label: 'Nota Crédito C' }
                  ]}
                  value={formData.tipo_comprobante}
                  onChange={(value) => 
                    setFormData(prev => ({ ...prev, tipo_comprobante: value as InvoiceType }))
                  }
                />

                {/* Cliente */}
                <InputField
                  label="Denominación del Cliente"
                  value={formData.denominacion_cliente}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, denominacion_cliente: e.target.value }))
                  }
                  placeholder="Nombre o razón social"
                />

                <InputField
                  label="CUIT (opcional)"
                  value={formData.cuit_cliente}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, cuit_cliente: e.target.value }))
                  }
                  placeholder="XX-XXXXXXXX-X"
                />

                <SelectField
                  label="Condición IVA"
                  options={[
                    { value: '01', label: 'Responsable Inscripto' },
                    { value: '05', label: 'Consumidor Final' },
                    { value: '06', label: 'Responsable Monotributo' },
                    { value: '02', label: 'Exento' }
                  ]}
                  value={formData.condicion_iva_cliente}
                  onChange={(value) => 
                    setFormData(prev => ({ ...prev, condicion_iva_cliente: value as CondicionIVA }))
                  }
                />

                {/* Items */}
                <VStack gap="md" align="stretch">
                  <HStack justify="space-between">
                    <Typography variant="title">Items</Typography>
                    <Button size="sm" onClick={addItem}>
                      Agregar Item
                    </Button>
                  </HStack>

                  {formData.items.map((item, index) => (
                    <CardWrapper key={index} variant="outline" padding="md">
                      <CardWrapper.Body>
                        <VStack gap="sm">
                          <HStack justify="space-between" align="center">
                            <Typography variant="label">Item {index + 1}</Typography>
                            {formData.items.length > 1 && (
                              <Button
                                size="sm"
                                variant="outline"
                                colorPalette="red"
                                onClick={() => removeItem(index)}
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            )}
                          </HStack>

                          <InputField
                            label="Descripción"
                            value={item.descripcion}
                            onChange={(e) => updateItem(index, 'descripcion', e.target.value)}
                            placeholder="Descripción del producto/servicio"
                          />

                          <HStack gap="md">
                            <NumberField
                              label="Cantidad"
                              value={item.cantidad}
                              onChange={(value) => updateItem(index, 'cantidad', value || 1)}
                              min={1}
                            />

                            <NumberField
                              label="Precio Unitario"
                              value={item.precio_unitario}
                              onChange={(value) => updateItem(index, 'precio_unitario', value || 0)}
                              min={0}
                            />
                          </HStack>

                          <Typography variant="caption" color="text.muted">
                            Subtotal: ${(item.cantidad * item.precio_unitario).toFixed(2)}
                          </Typography>
                        </VStack>
                      </CardWrapper.Body>
                    </CardWrapper>
                  ))}
                </VStack>

                {/* Totales */}
                <CardWrapper variant="elevated" padding="md">
                  <CardWrapper.Body>
                    <VStack gap="sm">
                      <Typography variant="title">Totales</Typography>
                      <HStack justify="space-between">
                        <Typography variant="body">Subtotal:</Typography>
                        <Typography variant="body">
                          ${formData.items.reduce((sum, item) => 
                            sum + (item.cantidad * item.precio_unitario), 0
                          ).toFixed(2)}
                        </Typography>
                      </HStack>
                      <HStack justify="space-between">
                        <Typography variant="body">IVA 21%:</Typography>
                        <Typography variant="body">
                          ${(formData.items.reduce((sum, item) => 
                            sum + (item.cantidad * item.precio_unitario), 0
                          ) * 0.21).toFixed(2)}
                        </Typography>
                      </HStack>
                      <HStack justify="space-between">
                        <Typography variant="title">Total:</Typography>
                        <Typography variant="title">
                          ${(formData.items.reduce((sum, item) => 
                            sum + (item.cantidad * item.precio_unitario), 0
                          ) * 1.21).toFixed(2)}
                        </Typography>
                      </HStack>
                    </VStack>
                  </CardWrapper.Body>
                </CardWrapper>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <ModalClose>
                <Button variant="outline">Cancelar</Button>
              </ModalClose>
              <Button
                colorPalette="green"
                loading={isCreating}
                onClick={handleCreateInvoice}
                disabled={!formData.denominacion_cliente || formData.items.some(item => !item.descripcion)}
              >
                Crear Factura
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </HStack>

      {/* Mode Status */}
      {mode !== 'online' && (
        <Alert status="info" title="Modo Offline/Híbrido">
          <AlertDescription>
            Las facturas se generarán localmente y se sincronizarán con AFIP cuando la conexión esté disponible.
          </AlertDescription>
        </Alert>
      )}

      {/* Invoices List */}
      <CardWrapper variant="elevated" padding="md">
        <CardWrapper.Header>
          <Typography variant="title">Facturas Recientes</Typography>
        </CardWrapper.Header>
        <CardWrapper.Body>
          {isLoading ? (
            <VStack gap="md">
              <Typography variant="body" color="text.muted">Cargando facturas...</Typography>
            </VStack>
          ) : invoices.length === 0 ? (
            <VStack gap="md">
              <Typography variant="body" color="text.muted">No hay facturas generadas</Typography>
              <Typography variant="caption" color="text.muted">
                Crea tu primera factura usando el botón "Nueva Factura"
              </Typography>
            </VStack>
          ) : (
            <VStack gap="sm" align="stretch">
              {invoices.slice(0, 10).map((invoice) => (
                <CardWrapper key={invoice.id} variant="outline" padding="sm">
                  <CardWrapper.Body>
                    <HStack justify="space-between" align="center">
                      <VStack gap="xs" align="start">
                        <HStack gap="sm">
                          <Typography variant="label">
                            Factura #{invoice.numero}
                          </Typography>
                          {getStatusBadge(invoice)}
                        </HStack>
                        <Typography variant="body">{invoice.denominacion_cliente}</Typography>
                        <Typography variant="caption" color="text.muted">
                          {new Date(invoice.fecha_emision).toLocaleDateString('es-AR')}
                        </Typography>
                      </VStack>

                      <VStack gap="xs" align="end">
                        <Typography variant="title">
                          ${invoice.total.toLocaleString('es-AR')}
                        </Typography>
                        <HStack gap="sm">
                          <Button size="sm" variant="outline">
                            <EyeIcon className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <PrinterIcon className="w-4 h-4" />
                          </Button>
                        </HStack>
                      </VStack>
                    </HStack>
                  </CardWrapper.Body>
                </CardWrapper>
              ))}
            </VStack>
          )}
        </CardWrapper.Body>
      </CardWrapper>
    </VStack>
  );
}
