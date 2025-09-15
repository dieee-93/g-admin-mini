// Fiscal Module Types - Argentine Tax Compliance & AFIP Integration
// Based on architecture-plan.md requirements

export interface AFIPConfiguration {
  cuit: string;
  certificate_path: string;
  private_key_path: string;
  environment: 'testing' | 'production';
  punto_venta: number;
  ultimo_comprobante?: number;
}

export interface Invoice {
  id: string;
  numero: number;
  punto_venta: number;
  tipo_comprobante: InvoiceType;
  fecha_emision: string;
  cuit_cliente?: string;
  denominacion_cliente: string;
  condicion_iva_cliente: CondicionIVA;
  domicilio_cliente?: string;
  
  // Amounts
  subtotal: number;
  iva_105: number;
  iva_21: number;
  percepciones: number;
  retenciones: number;
  total: number;
  
  // AFIP Response
  cae?: string;
  cae_vencimiento?: string;
  resultado: 'A' | 'R' | 'P'; // Aprobado, Rechazado, Pendiente
  observaciones?: string[];
  
  // Items
  items: InvoiceItem[];
  
  // Relations
  sale_id?: string;
  
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  codigo?: string;
  descripcion: string;
  cantidad: number;
  unidad_medida: UnidadMedida;
  precio_unitario: number;
  bonificacion: number;
  alicuota_iva: AlicuotaIVA;
  importe_iva: number;
  importe_neto: number;
}

export interface TaxReport {
  id: string;
  periodo: string; // YYYY-MM
  tipo: 'iva_ventas' | 'iva_compras' | 'ingresos_brutos' | 'ganancias';
  
  // IVA Ventas
  ventas_netas?: number;
  iva_debito_fiscal?: number;
  
  // IVA Compras  
  compras_netas?: number;
  iva_credito_fiscal?: number;
  
  // Balance
  saldo_a_favor?: number;
  saldo_a_pagar?: number;
  
  // Status
  presentado: boolean;
  fecha_presentacion?: string;
  
  created_at: string;
}

export interface FinancialReport {
  id: string;
  tipo: 'profit_loss' | 'balance' | 'cash_flow' | 'tax_summary';
  periodo_inicio: string;
  periodo_fin: string;
  
  // P&L Data
  ingresos?: {
    ventas_netas: number;
    otros_ingresos: number;
    total: number;
  };
  
  egresos?: {
    costo_ventas: number;
    gastos_operativos: number;
    gastos_administrativos: number;
    impuestos: number;
    total: number;
  };
  
  resultado?: {
    bruto: number;
    operativo: number;
    neto: number;
    margen_bruto: number;
    margen_operativo: number;
  };
  
  // Balance Data
  activos?: {
    corrientes: number;
    no_corrientes: number;
    total: number;
  };
  
  pasivos?: {
    corrientes: number;
    no_corrientes: number;
    total: number;
  };
  
  patrimonio?: {
    capital: number;
    resultados_acumulados: number;
    resultado_ejercicio: number;
    total: number;
  };
  
  // Tax Summary
  resumen_impuestos?: {
    iva_a_pagar: number;
    ingresos_brutos: number;
    ganancias: number;
    percepciones_sufridas: number;
    retenciones_sufridas: number;
    total_obligaciones: number;
  };
  
  generated_at: string;
  generated_by: string;
}

export interface PaymentRecord {
  id: string;
  invoice_id: string;
  forma_pago: FormaPago;
  importe: number;
  fecha_pago: string;
  referencia?: string; // Transaction ID, check number, etc.
  banco?: string;
  cuenta?: string;
  estado: 'pendiente' | 'confirmado' | 'rechazado' | 'conciliado';
  conciliado_at?: string;
  created_at: string;
}

// Enums for AFIP compliance
export enum InvoiceType {
  FACTURA_A = '001',
  FACTURA_B = '006', 
  FACTURA_C = '011',
  FACTURA_E = '019',
  NOTA_CREDITO_A = '002',
  NOTA_CREDITO_B = '007',
  NOTA_CREDITO_C = '012',
  NOTA_DEBITO_A = '003',
  NOTA_DEBITO_B = '008',
  NOTA_DEBITO_C = '013'
}

export enum CondicionIVA {
  RESPONSABLE_INSCRIPTO = '01',
  EXENTO = '02',
  CONSUMIDOR_FINAL = '05',
  RESPONSABLE_MONOTRIBUTO = '06',
  SUJETO_NO_CATEGORIZADO = '07'
}

export enum AlicuotaIVA {
  EXENTO = '003',
  IVA_105 = '004',
  IVA_21 = '005'
}

export enum UnidadMedida {
  UNIDADES = '07',
  KILOGRAMOS = '03',
  LITROS = '05',
  METROS = '02',
  HORAS = '06'
}

export enum FormaPago {
  EFECTIVO = '01',
  TARJETA_DEBITO = '02',
  TARJETA_CREDITO = '03',
  TRANSFERENCIA = '04',
  CHEQUE = '05',
  MERCADO_PAGO = '99'
}

export interface FiscalStats {
  facturacion_mes_actual: number;
  iva_a_pagar_mes: number;
  ingresos_brutos_mes: number;
  facturas_emitidas_mes: number;
  cae_pendientes: number;
  observaciones_pendientes: number;
  ultimo_respaldo: string;
  proxima_presentacion: string;
}

// Event types for event-driven architecture
export interface FiscalEvents {
  INVOICE_GENERATED: {
    invoice_id: string;
    sale_id: string;
    total: number;
    tipo_comprobante: InvoiceType;
  };
  
  CAE_OBTAINED: {
    invoice_id: string;
    cae: string;
    cae_vencimiento: string;
  };
  
  CAE_REJECTED: {
    invoice_id: string;
    observaciones: string[];
    retry_count: number;
  };
  
  PAYMENT_PROCESSED: {
    payment_id: string;
    invoice_id: string;
    amount: number;
    forma_pago: FormaPago;
  };
  
  TAX_PERIOD_CLOSED: {
    periodo: string;
    tipo: string;
    amount_due: number;
  };
}