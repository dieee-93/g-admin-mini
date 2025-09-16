/**
 * Fiscal Analytics Enhanced - Using AnalyticsEngine patterns
 * Specialized fiscal analytics with P&L statements, tax analysis, and compliance metrics
 */
import React, { useMemo } from 'react';
import {
  ContentLayout, PageHeader, Section, StatsSection, CardGrid, MetricCard,
  Button, Badge, Icon, Stack, Typography
} from '@/shared/ui';
import {
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ReceiptTaxIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { AnalyticsEngine, RFMAnalytics, TrendAnalytics } from '@/shared/services/AnalyticsEngine';

// Fiscal-specific analytics types
interface FiscalTransaction {
  id: string;
  invoice_number: string;
  invoice_type: 'A' | 'B' | 'C' | 'E';
  customer_id: string;
  customer_name: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: 'ARS' | 'USD' | 'EUR';
  payment_method: string;
  payment_status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  afip_status: 'approved' | 'pending' | 'rejected' | 'not_sent';
  compliance_score: number;
  tax_breakdown: {
    iva_21: number;
    iva_105: number;
    iva_27: number;
    iva_0: number;
    exento: number;
  };
}

interface FiscalMetrics {
  totalRevenue: number;
  totalTaxes: number;
  netRevenue: number;
  taxRate: number;
  complianceRate: number;
  afipApprovalRate: number;
  averageCollectionDays: number;
  overdueAmount: number;
}

interface ProfitLossStatement {
  period: string;
  revenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  taxes: number;
  netIncome: number;
  margins: {
    gross: number;
    operating: number;
    net: number;
  };
}

interface TaxAnalysisQuadrant {
  name: string;
  description: string;
  transactions: FiscalTransaction[];
  count: number;
  totalAmount: number;
  averageCompliance: number;
  color: string;
  icon: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionRecommendations: string[];
}

interface FiscalAnalyticsEnhancedProps {
  transactions?: FiscalTransaction[];
  timeframe?: '1M' | '3M' | '6M' | '1Y';
}

// Mock data generator for demonstration
const generateMockFiscalData = (): FiscalTransaction[] => {
  const invoiceTypes = ['A', 'B', 'C', 'E'];
  const currencies = ['ARS', 'USD', 'EUR'];
  const paymentMethods = ['cash', 'card', 'transfer', 'check'];
  const paymentStatuses = ['paid', 'pending', 'overdue', 'cancelled'];
  const afipStatuses = ['approved', 'pending', 'rejected', 'not_sent'];

  return Array.from({ length: 200 }, (_, i) => {
    const subtotal = 1000 + Math.random() * 50000;
    const taxRate = Math.random() > 0.3 ? 21 : Math.random() > 0.5 ? 10.5 : 0;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    return {
      id: `fiscal_${i + 1}`,
      invoice_number: `0001-${(i + 1).toString().padStart(8, '0')}`,
      invoice_type: invoiceTypes[Math.floor(Math.random() * invoiceTypes.length)] as any,
      customer_id: `cust_${Math.floor(i / 10) + 1}`,
      customer_name: `Cliente ${Math.floor(i / 10) + 1}`,
      issue_date: new Date(2024, 0, 1 + Math.floor(i / 3)).toISOString().split('T')[0],
      due_date: new Date(2024, 0, 1 + Math.floor(i / 3) + 30).toISOString().split('T')[0],
      subtotal: Math.round(subtotal * 100) / 100,
      tax_amount: Math.round(taxAmount * 100) / 100,
      total_amount: Math.round(totalAmount * 100) / 100,
      currency: currencies[Math.floor(Math.random() * currencies.length)] as any,
      payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      payment_status: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)] as any,
      afip_status: afipStatuses[Math.floor(Math.random() * afipStatuses.length)] as any,
      compliance_score: 60 + Math.random() * 40, // 60-100 range
      tax_breakdown: {
        iva_21: taxRate === 21 ? taxAmount : 0,
        iva_105: taxRate === 10.5 ? taxAmount : 0,
        iva_27: 0,
        iva_0: taxRate === 0 ? 0 : 0,
        exento: taxRate === 0 ? subtotal : 0
      }
    };
  });
};

export function FiscalAnalyticsEnhanced({
  transactions = generateMockFiscalData(),
  timeframe = '3M'
}: FiscalAnalyticsEnhancedProps) {

  // Core analytics calculations
  const analytics = useMemo(() => {
    const activeTransactions = transactions.filter(t => t.payment_status !== 'cancelled');

    // Basic fiscal metrics
    const metrics: FiscalMetrics = {
      totalRevenue: activeTransactions.reduce((sum, t) => sum + t.total_amount, 0),
      totalTaxes: activeTransactions.reduce((sum, t) => sum + t.tax_amount, 0),
      netRevenue: activeTransactions.reduce((sum, t) => sum + t.subtotal, 0),
      taxRate: activeTransactions.length > 0 ?
        (activeTransactions.reduce((sum, t) => sum + t.tax_amount, 0) /
         activeTransactions.reduce((sum, t) => sum + t.subtotal, 0)) * 100 : 0,
      complianceRate: activeTransactions.length > 0 ?
        (activeTransactions.filter(t => t.compliance_score >= 80).length / activeTransactions.length) * 100 : 0,
      afipApprovalRate: activeTransactions.length > 0 ?
        (activeTransactions.filter(t => t.afip_status === 'approved').length / activeTransactions.length) * 100 : 0,
      averageCollectionDays: 25 + Math.random() * 20, // Mock calculation
      overdueAmount: activeTransactions
        .filter(t => t.payment_status === 'overdue')
        .reduce((sum, t) => sum + t.total_amount, 0)
    };

    // Profit & Loss Statement (simplified)
    const profitLoss: ProfitLossStatement = {
      period: `${timeframe} - 2024`,
      revenue: metrics.totalRevenue,
      costOfGoodsSold: metrics.totalRevenue * 0.4, // Estimated 40%
      grossProfit: metrics.totalRevenue * 0.6,
      operatingExpenses: metrics.totalRevenue * 0.35, // Estimated 35%
      operatingIncome: metrics.totalRevenue * 0.25,
      taxes: metrics.totalTaxes,
      netIncome: metrics.totalRevenue * 0.25 - metrics.totalTaxes,
      margins: {
        gross: 60,
        operating: 25,
        net: (metrics.totalRevenue * 0.25 - metrics.totalTaxes) / metrics.totalRevenue * 100
      }
    };

    // Tax Analysis Quadrants (Compliance vs Amount matrix)
    const taxQuadrants: TaxAnalysisQuadrant[] = [
      {
        name: 'Perfect Compliance',
        description: 'Alta compliance, montos significativos',
        transactions: activeTransactions.filter(t =>
          t.compliance_score >= 90 &&
          t.total_amount >= 10000 &&
          t.afip_status === 'approved'
        ),
        count: 0,
        totalAmount: 0,
        averageCompliance: 95,
        color: 'green',
        icon: TrophyIcon,
        priority: 'low',
        actionRecommendations: [
          'Mantener procedimientos actuales',
          'Usar como referencia para otros casos',
          'Optimizar tiempos de procesamiento',
          'Documentar mejores prácticas'
        ]
      },
      {
        name: 'High Value Risk',
        description: 'Montos altos con compliance regular',
        transactions: activeTransactions.filter(t =>
          t.compliance_score >= 60 && t.compliance_score < 90 &&
          t.total_amount >= 10000
        ),
        count: 0,
        totalAmount: 0,
        averageCompliance: 75,
        color: 'orange',
        icon: ExclamationTriangleIcon,
        priority: 'high',
        actionRecommendations: [
          'Revisión urgente de documentación',
          'Validación adicional antes de envío',
          'Capacitación en normativa fiscal',
          'Auditoría de procesos internos'
        ]
      },
      {
        name: 'Low Risk Operations',
        description: 'Compliance alta, montos menores',
        transactions: activeTransactions.filter(t =>
          t.compliance_score >= 90 &&
          t.total_amount < 10000
        ),
        count: 0,
        totalAmount: 0,
        averageCompliance: 92,
        color: 'blue',
        icon: CheckCircleIcon,
        priority: 'medium',
        actionRecommendations: [
          'Automatizar procesos similares',
          'Establecer workflows eficientes',
          'Mantener estándares de calidad',
          'Considerar procesamiento por lotes'
        ]
      },
      {
        name: 'Critical Issues',
        description: 'Baja compliance en todos los montos',
        transactions: activeTransactions.filter(t =>
          t.compliance_score < 60 ||
          t.afip_status === 'rejected'
        ),
        count: 0,
        totalAmount: 0,
        averageCompliance: 45,
        color: 'red',
        icon: XCircleIcon,
        priority: 'critical',
        actionRecommendations: [
          'Revisión inmediata y corrección',
          'Suspender hasta resolver issues',
          'Consultoría fiscal especializada',
          'Implementar controles adicionales'
        ]
      }
    ];

    // Calculate quadrant statistics
    taxQuadrants.forEach(quadrant => {
      quadrant.count = quadrant.transactions.length;
      quadrant.totalAmount = quadrant.transactions.reduce((sum, t) => sum + t.total_amount, 0);
      quadrant.averageCompliance = quadrant.count > 0 ?
        quadrant.transactions.reduce((sum, t) => sum + t.compliance_score, 0) / quadrant.count : 0;
    });

    // Invoice type analysis
    const invoiceTypeAnalysis = ['A', 'B', 'C', 'E'].map(type => {
      const typeTransactions = activeTransactions.filter(t => t.invoice_type === type);
      return {
        type,
        count: typeTransactions.length,
        totalAmount: typeTransactions.reduce((sum, t) => sum + t.total_amount, 0),
        averageAmount: typeTransactions.length > 0 ?
          typeTransactions.reduce((sum, t) => sum + t.total_amount, 0) / typeTransactions.length : 0,
        complianceRate: typeTransactions.length > 0 ?
          (typeTransactions.filter(t => t.compliance_score >= 80).length / typeTransactions.length) * 100 : 0
      };
    });

    // Tax collection analysis
    const taxAnalysis = {
      totalTaxCollected: metrics.totalTaxes,
      byRate: {
        iva_21: activeTransactions.reduce((sum, t) => sum + t.tax_breakdown.iva_21, 0),
        iva_105: activeTransactions.reduce((sum, t) => sum + t.tax_breakdown.iva_105, 0),
        exento: activeTransactions.reduce((sum, t) => sum + t.tax_breakdown.exento, 0)
      },
      averageEffectiveRate: metrics.taxRate
    };

    // Revenue trend analysis
    const revenueTrend = TrendAnalytics.calculateTrend(
      activeTransactions.map((transaction, index) => ({
        date: transaction.issue_date,
        value: transaction.total_amount
      })).slice(0, 50) // Last 50 transactions for trend
    );

    return {
      metrics,
      profitLoss,
      taxQuadrants,
      invoiceTypeAnalysis,
      taxAnalysis,
      revenueTrend
    };
  }, [transactions, timeframe]);

  // Generate insights and recommendations
  const insights = useMemo(() => {
    const { metrics, profitLoss, taxQuadrants } = analytics;
    const insights = [];

    // Revenue insights
    if (profitLoss.margins.net < 10) {
      insights.push({
        type: 'profitability',
        priority: 'critical',
        message: `Margen neto bajo (${profitLoss.margins.net.toFixed(1)}%)`,
        recommendation: 'Revisar estructura de costos y optimizar operaciones'
      });
    }

    // Compliance insights
    if (metrics.complianceRate < 85) {
      insights.push({
        type: 'compliance',
        priority: 'high',
        message: `Tasa de cumplimiento baja (${metrics.complianceRate.toFixed(1)}%)`,
        recommendation: 'Implementar controles adicionales y capacitación fiscal'
      });
    }

    // AFIP approval insights
    if (metrics.afipApprovalRate < 95) {
      insights.push({
        type: 'afip',
        priority: 'high',
        message: `Tasa de aprobación AFIP baja (${metrics.afipApprovalRate.toFixed(1)}%)`,
        recommendation: 'Revisar procesos de validación antes del envío'
      });
    }

    // Cash flow insights
    if (metrics.overdueAmount > metrics.totalRevenue * 0.1) {
      insights.push({
        type: 'cashflow',
        priority: 'medium',
        message: `Monto vencido alto ($${metrics.overdueAmount.toLocaleString()})`,
        recommendation: 'Mejorar gestión de cobranzas y políticas de crédito'
      });
    }

    // Tax efficiency insights
    if (metrics.taxRate > 25) {
      insights.push({
        type: 'tax_efficiency',
        priority: 'medium',
        message: `Carga tributaria alta (${metrics.taxRate.toFixed(1)}%)`,
        recommendation: 'Evaluar estrategias de planificación fiscal legal'
      });
    }

    // Critical issues insights
    const criticalIssues = taxQuadrants.find(q => q.name === 'Critical Issues');
    if (criticalIssues && criticalIssues.count > 0) {
      insights.push({
        type: 'critical',
        priority: 'critical',
        message: `${criticalIssues.count} transacciones con issues críticos`,
        recommendation: 'Atención inmediata requerida para evitar sanciones'
      });
    }

    return insights.slice(0, 6); // Top 6 insights
  }, [analytics]);

  return (
    <ContentLayout spacing="normal">
      <PageHeader
        title="📊 Analytics Fiscal"
        subtitle="Análisis completo de performance fiscal, compliance y rentabilidad"
        icon={BuildingLibraryIcon}
      />

      {/* Key Fiscal Metrics */}
      <StatsSection>
        <CardGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">
          <MetricCard
            title="Facturación Total"
            value={`$${analytics.metrics.totalRevenue.toLocaleString()}`}
            icon={CurrencyDollarIcon}
            colorPalette="green"
            trend={{
              value: analytics.revenueTrend.growthRate || 0,
              isPositive: (analytics.revenueTrend.growthRate || 0) > 0
            }}
          />
          <MetricCard
            title="Tasa de Compliance"
            value={`${analytics.metrics.complianceRate.toFixed(1)}%`}
            icon={CheckCircleIcon}
            colorPalette={analytics.metrics.complianceRate >= 85 ? "green" : "orange"}
          />
          <MetricCard
            title="Aprobación AFIP"
            value={`${analytics.metrics.afipApprovalRate.toFixed(1)}%`}
            icon={DocumentTextIcon}
            colorPalette={analytics.metrics.afipApprovalRate >= 95 ? "green" : "red"}
          />
          <MetricCard
            title="Margen Neto"
            value={`${analytics.profitLoss.margins.net.toFixed(1)}%`}
            icon={ArrowTrendingUpIcon}
            colorPalette={analytics.profitLoss.margins.net >= 15 ? "green" : "orange"}
          />
        </CardGrid>
      </StatsSection>

      {/* Profit & Loss Statement */}
      <Section variant="elevated" title="📈 Estado de Resultados">
        <Typography variant="body" size="sm" color="text.muted" mb="lg">
          Análisis financiero del período {analytics.profitLoss.period}
        </Typography>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid var(--colors-gray-200)' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'green' }}>
              Ingresos
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              ${analytics.profitLoss.revenue.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'gray' }}>
              Facturación total
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid var(--colors-gray-200)' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'orange' }}>
              Costo de Ventas
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              ${analytics.profitLoss.costOfGoodsSold.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'gray' }}>
              {((analytics.profitLoss.costOfGoodsSold / analytics.profitLoss.revenue) * 100).toFixed(1)}% de ingresos
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid var(--colors-gray-200)' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'blue' }}>
              Ganancia Bruta
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              ${analytics.profitLoss.grossProfit.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'gray' }}>
              Margen: {analytics.profitLoss.margins.gross.toFixed(1)}%
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid var(--colors-gray-200)' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'purple' }}>
              Resultado Neto
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: analytics.profitLoss.netIncome > 0 ? 'green' : 'red' }}>
              ${analytics.profitLoss.netIncome.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'gray' }}>
              Margen: {analytics.profitLoss.margins.net.toFixed(1)}%
            </div>
          </div>
        </div>
      </Section>

      {/* Tax Analysis Quadrants */}
      <Section variant="elevated" title="🎯 Matriz de Análisis Fiscal">
        <Typography variant="body" size="sm" color="text.muted" mb="lg">
          Análisis de transacciones por compliance vs monto - Identificación de riesgos y oportunidades
        </Typography>

        <CardGrid columns={{ base: 1, md: 2, lg: 4 }} gap="md">
          {analytics.taxQuadrants.map((quadrant, index) => (
            <div
              key={index}
              style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: `2px solid var(--colors-${quadrant.color}-200)`,
                borderLeft: `6px solid var(--colors-${quadrant.color}-500)`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Icon icon={quadrant.icon} size="sm" color={`${quadrant.color}.600`} />
                <div>
                  <div style={{ fontWeight: 'bold', color: `var(--colors-${quadrant.color}-800)` }}>
                    {quadrant.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'gray', marginBottom: '4px' }}>
                    {quadrant.description}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                  <div><strong>Facturas:</strong> {quadrant.count}</div>
                  <div><strong>Compliance:</strong> {quadrant.averageCompliance.toFixed(0)}%</div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <strong>Total:</strong> ${quadrant.totalAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: `var(--colors-${quadrant.color}-700)` }}>
                  Acciones:
                </div>
                <ul style={{ fontSize: '11px', color: 'gray', margin: 0, paddingLeft: '16px' }}>
                  {quadrant.actionRecommendations.slice(0, 2).map((rec, i) => (
                    <li key={i} style={{ marginBottom: '2px' }}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </CardGrid>
      </Section>

      {/* Invoice Type Analysis */}
      <Section variant="elevated" title="📄 Análisis por Tipo de Comprobante">
        <CardGrid columns={{ base: 1, md: 2, lg: 4 }} gap="md">
          {analytics.invoiceTypeAnalysis.map((type, index) => (
            <div
              key={index}
              style={{
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid var(--colors-gray-200)'
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '18px', color: 'blue' }}>
                  Tipo {type.type}
                </div>
                <div style={{ fontSize: '13px', color: 'gray' }}>
                  {type.count} comprobantes
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px', fontSize: '13px' }}>
                <div>
                  <strong>Total:</strong> ${type.totalAmount.toLocaleString()}
                </div>
                <div>
                  <strong>Promedio:</strong> ${type.averageAmount.toLocaleString()}
                </div>
                <div>
                  <strong>Compliance:</strong>
                  <span style={{ color: type.complianceRate >= 85 ? 'green' : 'orange', marginLeft: '4px' }}>
                    {type.complianceRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </CardGrid>
      </Section>

      {/* Tax Collection Analysis */}
      <Section variant="elevated" title="💰 Análisis de Recaudación Tributaria">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'red' }}>
              ${analytics.taxAnalysis.byRate.iva_21.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'gray' }}>IVA 21%</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'orange' }}>
              ${analytics.taxAnalysis.byRate.iva_105.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'gray' }}>IVA 10.5%</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>
              ${analytics.taxAnalysis.byRate.exento.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'gray' }}>Exento</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'purple' }}>
              {analytics.taxAnalysis.averageEffectiveRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: '12px', color: 'gray' }}>Tasa Efectiva</div>
          </div>
        </div>
      </Section>

      {/* Insights and Recommendations */}
      <Section variant="elevated" title="💡 Insights y Recomendaciones">
        <Typography variant="body" size="sm" color="text.muted" mb="lg">
          Análisis inteligente de performance fiscal y oportunidades de optimización
        </Typography>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
          {insights.map((insight, index) => (
            <div
              key={index}
              style={{
                padding: '16px',
                backgroundColor: insight.priority === 'critical' ? 'var(--colors-red-50)' :
                                insight.priority === 'high' ? 'var(--colors-orange-50)' :
                                'var(--colors-blue-50)',
                borderRadius: '6px',
                border: `1px solid var(--colors-${insight.priority === 'critical' ? 'red' :
                                                   insight.priority === 'high' ? 'orange' : 'blue'}-200)`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Badge
                  variant="solid"
                  colorPalette={insight.priority === 'critical' ? 'red' :
                               insight.priority === 'high' ? 'orange' : 'blue'}
                  size="sm"
                >
                  {insight.priority.toUpperCase()}
                </Badge>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '14px' }}>
                    {insight.message}
                  </div>
                  <div style={{ fontSize: '13px', color: 'gray', fontStyle: 'italic' }}>
                    💡 {insight.recommendation}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Cash Flow Analysis */}
      <Section variant="elevated" title="💸 Análisis de Flujo de Efectivo">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>
              ${(analytics.metrics.totalRevenue - analytics.metrics.overdueAmount).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'gray' }}>Cobrado</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'red' }}>
              ${analytics.metrics.overdueAmount.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'gray' }}>Vencido</div>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '6px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'blue' }}>
              {analytics.metrics.averageCollectionDays.toFixed(0)}
            </div>
            <div style={{ fontSize: '12px', color: 'gray' }}>Días Promedio</div>
          </div>
        </div>
      </Section>
    </ContentLayout>
  );
}