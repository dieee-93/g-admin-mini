import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Select,
  Table,
  Badge,
  Card,
  Alert,
  NumberInput,
  Textarea,
  SimpleGrid,
  IconButton,
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  createListCollection,
  Separator
} from '@chakra-ui/react';
import {
  PlusIcon,
  DocumentTextIcon,
  EyeIcon,
  TrashIcon,
  PrinterIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { 
  type Invoice, 
  type InvoiceItem, 
  InvoiceType, 
  CondicionIVA, 
  AlicuotaIVA,
  UnidadMedida 
} from '../../types';
import { fiscalApi } from '../../data/fiscalApi';
import { notify } from '@/lib/notifications';

interface InvoiceFormData {
  tipo_comprobante: InvoiceType;
  cuit_cliente?: string;
  denominacion_cliente: string;
  condicion_iva_cliente: CondicionIVA;
  domicilio_cliente?: string;
  items: InvoiceItem[];
}

const invoiceTypeOptions = createListCollection({
  items: [
    { value: InvoiceType.FACTURA_A, label: 'Factura A - Responsable Inscripto' },
    { value: InvoiceType.FACTURA_B, label: 'Factura B - Exento/Monotributo' },
    { value: InvoiceType.FACTURA_C, label: 'Factura C - Consumidor Final' },
    { value: InvoiceType.FACTURA_E, label: 'Factura E - Exportación' }
  ]
});

const condicionIVAOptions = createListCollection({
  items: [
    { value: CondicionIVA.RESPONSABLE_INSCRIPTO, label: 'Responsable Inscripto' },
    { value: CondicionIVA.EXENTO, label: 'Exento' },
    { value: CondicionIVA.CONSUMIDOR_FINAL, label: 'Consumidor Final' },
    { value: CondicionIVA.RESPONSABLE_MONOTRIBUTO, label: 'Responsable Monotributo' }
  ]
});

const alicuotaIVAOptions = createListCollection({
  items: [
    { value: AlicuotaIVA.EXENTO, label: 'Exento (0%)' },
    { value: AlicuotaIVA.IVA_105, label: 'IVA 10.5%' },
    { value: AlicuotaIVA.IVA_21, label: 'IVA 21%' }
  ]
});

export function InvoiceGeneration() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  const [invoiceForm, setInvoiceForm] = useState<InvoiceFormData>({
    tipo_comprobante: InvoiceType.FACTURA_C,
    denominacion_cliente: '',
    condicion_iva_cliente: CondicionIVA.CONSUMIDOR_FINAL,
    items: []
  });

  const [currentItem, setCurrentItem] = useState<Partial<InvoiceItem>>({
    descripcion: '',
    cantidad: 1,
    precio_unitario: 0,
    alicuota_iva: AlicuotaIVA.IVA_21,
    unidad_medida: UnidadMedida.UNIDADES
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const data = await fiscalApi.getInvoices();
      setInvoices(data);
    } catch (error) {
      notify.error('Error al cargar facturas');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateItemTotal = (item: Partial<InvoiceItem>) => {
    const cantidad = item.cantidad || 0;
    const precio = item.precio_unitario || 0;
    const bonificacion = item.bonificacion || 0;
    
    const neto = (cantidad * precio) - bonificacion;
    
    let ivaRate = 0;
    if (item.alicuota_iva === AlicuotaIVA.IVA_105) ivaRate = 0.105;
    if (item.alicuota_iva === AlicuotaIVA.IVA_21) ivaRate = 0.21;
    
    const iva = neto * ivaRate;
    
    return {
      importe_neto: neto,
      importe_iva: iva,
      total: neto + iva
    };
  };

  const addItemToInvoice = () => {
    if (!currentItem.descripcion || !currentItem.cantidad || !currentItem.precio_unitario) {
      notify.error('Complete todos los campos del item');
      return;
    }

    const calculated = calculateItemTotal(currentItem);
    
    const newItem: InvoiceItem = {
      ...currentItem as InvoiceItem,
      ...calculated,
      bonificacion: currentItem.bonificacion || 0
    };

    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    setCurrentItem({
      descripcion: '',
      cantidad: 1,
      precio_unitario: 0,
      alicuota_iva: AlicuotaIVA.IVA_21,
      unidad_medida: UnidadMedida.UNIDADES
    });
  };

  const removeItem = (index: number) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateInvoiceTotals = () => {
    const subtotal = invoiceForm.items.reduce((sum, item) => sum + item.importe_neto, 0);
    const iva_105 = invoiceForm.items
      .filter(item => item.alicuota_iva === AlicuotaIVA.IVA_105)
      .reduce((sum, item) => sum + item.importe_iva, 0);
    const iva_21 = invoiceForm.items
      .filter(item => item.alicuota_iva === AlicuotaIVA.IVA_21)
      .reduce((sum, item) => sum + item.importe_iva, 0);
    const total = subtotal + iva_105 + iva_21;

    return { subtotal, iva_105, iva_21, total };
  };

  const generateInvoice = async () => {
    try {
      if (invoiceForm.items.length === 0) {
        notify.error('Agregue al menos un item a la factura');
        return;
      }

      const totals = calculateInvoiceTotals();
      
      const invoiceData: Partial<Invoice> = {
        ...invoiceForm,
        ...totals,
        percepciones: 0,
        retenciones: 0,
        resultado: 'P' // Pendiente
      };

      const newInvoice = await fiscalApi.createInvoice(invoiceData);
      setInvoices(prev => [newInvoice, ...prev]);
      setShowInvoiceForm(false);
      setInvoiceForm({
        tipo_comprobante: InvoiceType.FACTURA_C,
        denominacion_cliente: '',
        condicion_iva_cliente: CondicionIVA.CONSUMIDOR_FINAL,
        items: []
      });
      
      notify.success('Factura generada exitosamente');
    } catch (error) {
      notify.error('Error al generar factura');
    }
  };

  const requestCAE = async (invoiceId: string) => {
    try {
      await fiscalApi.requestCAE(invoiceId);
      await fetchInvoices();
      notify.success('Solicitud de CAE enviada a AFIP');
    } catch (error) {
      notify.error('Error al solicitar CAE');
    }
  };

  const getStatusBadge = (invoice: Invoice) => {
    switch (invoice.resultado) {
      case 'A':
        return <Badge colorPalette="green" size="sm"><CheckCircleIcon className="w-3 h-3 mr-1" />Aprobado</Badge>;
      case 'R':
        return <Badge colorPalette="red" size="sm"><XCircleIcon className="w-3 h-3 mr-1" />Rechazado</Badge>;
      case 'P':
        return <Badge colorPalette="yellow" size="sm"><ExclamationCircleIcon className="w-3 h-3 mr-1" />Pendiente</Badge>;
    }
  };

  const totals = calculateInvoiceTotals();

  return (
    <VStack gap="6" align="stretch">
      {/* Header with action buttons */}
      <HStack justify="space-between">
        <Text fontSize="lg" fontWeight="semibold">Generación de Facturas</Text>
        <Button
          leftIcon={<PlusIcon className="w-4 h-4" />}
          colorPalette="blue"
          onClick={() => setShowInvoiceForm(true)}
        >
          Nueva Factura
        </Button>
      </HStack>

      {/* Recent Invoices */}
      <Card.Root>
        <Card.Body>
          <VStack align="stretch" gap="4">
            <Text fontSize="md" fontWeight="semibold">Facturas Recientes</Text>
            
            {isLoading ? (
              <Text color="gray.600">Cargando facturas...</Text>
            ) : invoices.length === 0 ? (
              <Text color="gray.600">No hay facturas generadas</Text>
            ) : (
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Número</Table.ColumnHeader>
                    <Table.ColumnHeader>Fecha</Table.ColumnHeader>
                    <Table.ColumnHeader>Cliente</Table.ColumnHeader>
                    <Table.ColumnHeader>Total</Table.ColumnHeader>
                    <Table.ColumnHeader>Estado</Table.ColumnHeader>
                    <Table.ColumnHeader>CAE</Table.ColumnHeader>
                    <Table.ColumnHeader>Acciones</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {invoices.map((invoice) => (
                    <Table.Row key={invoice.id}>
                      <Table.Cell>
                        <Text fontSize="sm" fontWeight="medium">
                          {String(invoice.punto_venta).padStart(4, '0')}-{String(invoice.numero).padStart(8, '0')}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm">
                          {new Date(invoice.fecha_emision).toLocaleDateString()}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm">{invoice.denominacion_cliente}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm" fontWeight="medium">
                          ${invoice.total.toLocaleString()}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        {getStatusBadge(invoice)}
                      </Table.Cell>
                      <Table.Cell>
                        <Text fontSize="sm" fontFamily="mono">
                          {invoice.cae || 'Pendiente'}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <HStack gap="1">
                          <IconButton
                            size="xs"
                            variant="ghost"
                            aria-label="Ver factura"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            <EyeIcon className="w-3 h-3" />
                          </IconButton>
                          {invoice.resultado === 'P' && (
                            <IconButton
                              size="xs"
                              variant="ghost"
                              colorPalette="green"
                              aria-label="Solicitar CAE"
                              onClick={() => requestCAE(invoice.id)}
                            >
                              <CheckCircleIcon className="w-3 h-3" />
                            </IconButton>
                          )}
                          {invoice.cae && (
                            <IconButton
                              size="xs"
                              variant="ghost"
                              colorPalette="blue"
                              aria-label="Imprimir"
                            >
                              <PrinterIcon className="w-3 h-3" />
                            </IconButton>
                          )}
                        </HStack>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* New Invoice Dialog */}
      <DialogRoot open={showInvoiceForm} onOpenChange={(e) => setShowInvoiceForm(e.open)}>
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent maxW="4xl">
            <DialogHeader>
              <DialogTitle>Nueva Factura Electrónica</DialogTitle>
              <DialogCloseTrigger />
            </DialogHeader>
            
            <DialogBody p="6">
              <VStack gap="6" align="stretch">
                {/* Invoice Header */}
                <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb="2">Tipo de Comprobante</Text>
                    <Select.Root
                      collection={invoiceTypeOptions}
                      value={[invoiceForm.tipo_comprobante]}
                      onValueChange={(e) => setInvoiceForm(prev => ({
                        ...prev,
                        tipo_comprobante: e.value[0] as InvoiceType
                      }))}
                    >
                      <Select.Trigger>
                        <Select.ValueText />
                      </Select.Trigger>
                      <Select.Content>
                        {invoiceTypeOptions.items.map(item => (
                          <Select.Item key={item.value} item={item}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb="2">Condición IVA Cliente</Text>
                    <Select.Root
                      collection={condicionIVAOptions}
                      value={[invoiceForm.condicion_iva_cliente]}
                      onValueChange={(e) => setInvoiceForm(prev => ({
                        ...prev,
                        condicion_iva_cliente: e.value[0] as CondicionIVA
                      }))}
                    >
                      <Select.Trigger>
                        <Select.ValueText />
                      </Select.Trigger>
                      <Select.Content>
                        {condicionIVAOptions.items.map(item => (
                          <Select.Item key={item.value} item={item}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb="2">Denominación Cliente</Text>
                    <Input
                      value={invoiceForm.denominacion_cliente}
                      onChange={(e) => setInvoiceForm(prev => ({
                        ...prev,
                        denominacion_cliente: e.target.value
                      }))}
                      placeholder="Razón social o nombre del cliente"
                    />
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb="2">CUIT Cliente (opcional)</Text>
                    <Input
                      value={invoiceForm.cuit_cliente || ''}
                      onChange={(e) => setInvoiceForm(prev => ({
                        ...prev,
                        cuit_cliente: e.target.value
                      }))}
                      placeholder="XX-XXXXXXXX-X"
                    />
                  </Box>
                </SimpleGrid>

                <Separator />

                {/* Add Item Section */}
                <VStack align="stretch" gap="4">
                  <Text fontSize="md" fontWeight="semibold">Agregar Items</Text>
                  
                  <SimpleGrid columns={{ base: 1, md: 5 }} gap="4">
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb="2">Descripción</Text>
                      <Input
                        value={currentItem.descripcion || ''}
                        onChange={(e) => setCurrentItem(prev => ({
                          ...prev,
                          descripcion: e.target.value
                        }))}
                        placeholder="Descripción del producto"
                      />
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb="2">Cantidad</Text>
                      <NumberInput.Root
                        value={currentItem.cantidad?.toString() || '1'}
                        onValueChange={(e) => setCurrentItem(prev => ({
                          ...prev,
                          cantidad: parseFloat(e.value) || 1
                        }))}
                        min={0.01}
                        step={0.01}
                      >
                        <NumberInput.Field />
                      </NumberInput.Root>
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb="2">Precio Unitario</Text>
                      <NumberInput.Root
                        value={currentItem.precio_unitario?.toString() || '0'}
                        onValueChange={(e) => setCurrentItem(prev => ({
                          ...prev,
                          precio_unitario: parseFloat(e.value) || 0
                        }))}
                        min={0}
                        step={0.01}
                      >
                        <NumberInput.Field />
                      </NumberInput.Root>
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb="2">Alícuota IVA</Text>
                      <Select.Root
                        collection={alicuotaIVAOptions}
                        value={[currentItem.alicuota_iva || AlicuotaIVA.IVA_21]}
                        onValueChange={(e) => setCurrentItem(prev => ({
                          ...prev,
                          alicuota_iva: e.value[0] as AlicuotaIVA
                        }))}
                      >
                        <Select.Trigger>
                          <Select.ValueText />
                        </Select.Trigger>
                        <Select.Content>
                          {alicuotaIVAOptions.items.map(item => (
                            <Select.Item key={item.value} item={item}>
                              {item.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Box>

                    <Box display="flex" alignItems="end">
                      <Button
                        leftIcon={<PlusIcon className="w-4 h-4" />}
                        onClick={addItemToInvoice}
                        colorPalette="green"
                        size="sm"
                        w="full"
                      >
                        Agregar
                      </Button>
                    </Box>
                  </SimpleGrid>
                </VStack>

                {/* Items List */}
                {invoiceForm.items.length > 0 && (
                  <VStack align="stretch" gap="4">
                    <Text fontSize="md" fontWeight="semibold">Items de la Factura</Text>
                    <Table.Root size="sm">
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeader>Descripción</Table.ColumnHeader>
                          <Table.ColumnHeader>Cant.</Table.ColumnHeader>
                          <Table.ColumnHeader>P. Unit.</Table.ColumnHeader>
                          <Table.ColumnHeader>Neto</Table.ColumnHeader>
                          <Table.ColumnHeader>IVA</Table.ColumnHeader>
                          <Table.ColumnHeader>Total</Table.ColumnHeader>
                          <Table.ColumnHeader></Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {invoiceForm.items.map((item, index) => (
                          <Table.Row key={index}>
                            <Table.Cell>{item.descripcion}</Table.Cell>
                            <Table.Cell>{item.cantidad}</Table.Cell>
                            <Table.Cell>${item.precio_unitario.toFixed(2)}</Table.Cell>
                            <Table.Cell>${item.importe_neto.toFixed(2)}</Table.Cell>
                            <Table.Cell>${item.importe_iva.toFixed(2)}</Table.Cell>
                            <Table.Cell>${(item.importe_neto + item.importe_iva).toFixed(2)}</Table.Cell>
                            <Table.Cell>
                              <IconButton
                                size="xs"
                                variant="ghost"
                                colorPalette="red"
                                aria-label="Eliminar item"
                                onClick={() => removeItem(index)}
                              >
                                <TrashIcon className="w-3 h-3" />
                              </IconButton>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>

                    {/* Totals */}
                    <Card.Root bg="gray.50">
                      <Card.Body p="4">
                        <VStack align="stretch" gap="2">
                          <HStack justify="space-between">
                            <Text fontSize="sm">Subtotal:</Text>
                            <Text fontSize="sm" fontWeight="medium">${totals.subtotal.toFixed(2)}</Text>
                          </HStack>
                          {totals.iva_105 > 0 && (
                            <HStack justify="space-between">
                              <Text fontSize="sm">IVA 10.5%:</Text>
                              <Text fontSize="sm" fontWeight="medium">${totals.iva_105.toFixed(2)}</Text>
                            </HStack>
                          )}
                          {totals.iva_21 > 0 && (
                            <HStack justify="space-between">
                              <Text fontSize="sm">IVA 21%:</Text>
                              <Text fontSize="sm" fontWeight="medium">${totals.iva_21.toFixed(2)}</Text>
                            </HStack>
                          )}
                          <Separator />
                          <HStack justify="space-between">
                            <Text fontSize="md" fontWeight="bold">Total:</Text>
                            <Text fontSize="md" fontWeight="bold">${totals.total.toFixed(2)}</Text>
                          </HStack>
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  </VStack>
                )}
              </VStack>
            </DialogBody>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowInvoiceForm(false)}
              >
                Cancelar
              </Button>
              <Button
                colorPalette="blue"
                onClick={generateInvoice}
                leftIcon={<DocumentTextIcon className="w-4 h-4" />}
                isDisabled={invoiceForm.items.length === 0}
              >
                Generar Factura
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>
    </VStack>
  );
}