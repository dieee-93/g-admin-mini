/**
 * Module EventBus Integration
 * Connects all modules using event-driven architecture
 */
import EventBus from '@/lib/events/EventBus';
import type { EventPattern } from '@/lib/events/types';

// Create instance
const eventBus = EventBus;

// Event type definitions for type safety
export interface ModuleEvents {
  // Customer events
  'customer.created': { customerId: string; customerData: any };
  'customer.updated': { customerId: string; customerData: any };
  'customer.deleted': { customerId: string };
  'customer.rfm_updated': { customerId: string; segment: string; scores: { r: number; f: number; m: number } };

  // Material/Inventory events
  'material.created': { materialId: string; materialData: any };
  'material.updated': { materialId: string; materialData: any };
  'material.deleted': { materialId: string };
  'material.stock_low': { materialId: string; currentStock: number; minStock: number };
  'material.stock_critical': { materialId: string; currentStock: number; minStock: number };
  'material.stock_adjusted': { materialId: string; adjustment: number; reason?: string };

  // Sales events
  'sale.created': { saleId: string; saleData: any; customerId?: string };
  'sale.completed': { saleId: string; total: number; customerId?: string; items: any[] };
  'sale.cancelled': { saleId: string; reason?: string };
  'sale.payment_processed': { saleId: string; paymentMethod: string; amount: number };
  'sale.analytics_updated': { totalSales: number; averageTicket: number; topItems: any[] };

  // Product events
  'product.created': { productId: string; productData: any };
  'product.updated': { productId: string; productData: any };
  'product.deleted': { productId: string };
  'product.recipe_updated': { productId: string; recipeId: string };

  // Staff events
  'staff.created': { staffId: string; staffData: any };
  'staff.updated': { staffId: string; staffData: any };
  'staff.schedule_changed': { staffId: string; scheduleData: any };
  'staff.performance_updated': { staffId: string; metrics: any };

  // Scheduling events
  'schedule.created': { scheduleId: string; staffId: string; scheduleData: any };
  'schedule.updated': { scheduleId: string; scheduleData: any };
  'schedule.conflict_detected': { staffId: string; conflictingSchedules: any[] };

  // Fiscal events
  'fiscal.invoice_created': { invoiceId: string; invoiceData: any };
  'fiscal.invoice_updated': { invoiceId: string; invoiceData: any };
  'fiscal.invoice_cancelled': { invoiceId: string; reason?: string };
  'fiscal.tax_calculated': { invoiceId: string; taxBreakdown: any; totalTax: number };
  'fiscal.afip_submitted': { invoiceId: string; cae?: string; status: string };
  'fiscal.payment_received': { invoiceId: string; amount: number; paymentMethod: string };

  // Recurring Billing events
  'billing.subscription_created': { subscriptionId: string; subscriptionData: any; customerId?: string };
  'billing.subscription_updated': { subscriptionId: string; subscriptionData: any };
  'billing.subscription_cancelled': { subscriptionId: string; reason?: string; customerId?: string };
  'billing.subscription_suspended': { subscriptionId: string; reason?: string; customerId?: string };
  'billing.subscription_reactivated': { subscriptionId: string; customerId?: string };
  'billing.invoice_generated': { subscriptionId: string; invoiceId: string; amount: number; dueDate: string };
  'billing.payment_succeeded': { subscriptionId: string; invoiceId: string; amount: number; customerId?: string };
  'billing.payment_failed': { subscriptionId: string; invoiceId: string; attempt: number; reason?: string };
  'billing.retry_scheduled': { subscriptionId: string; invoiceId: string; retryDate: string; attempt: number };
  'billing.dunning_triggered': { subscriptionId: string; customerId: string; overdueDays: number };
  'billing.churn_risk_detected': { customerId: string; subscriptionId: string; riskLevel: 'low' | 'medium' | 'high' };
  'billing.mrr_updated': { previousMrr: number; currentMrr: number; change: number; timestamp: string };

  // Membership Management events
  'membership.created': { membershipId: string; membershipData: any; customerId?: string };
  'membership.updated': { membershipId: string; membershipData: any };
  'membership.renewed': { membershipId: string; customerId: string; renewalData: any };
  'membership.cancelled': { membershipId: string; customerId: string; reason?: string };
  'membership.suspended': { membershipId: string; customerId: string; reason?: string };
  'membership.expired': { membershipId: string; customerId: string; expiredDate: string };
  'membership.visit_logged': { membershipId: string; customerId: string; facility: string; duration?: number };
  'membership.churn_risk_detected': { membershipId: string; customerId: string; riskLevel: 'low' | 'medium' | 'high'; inactivityDays: number };
  'membership.benefit_used': { membershipId: string; customerId: string; benefit: string; usage: any };
  'membership.engagement_score_updated': { membershipId: string; customerId: string; score: number; previousScore: number };
  'membership.upgrade_requested': { membershipId: string; customerId: string; fromType: string; toType: string };
  'membership.payment_overdue': { membershipId: string; customerId: string; overdueDays: number; amount: number };

  // Rental Management events
  'rental.created': { rentalId: string; rentalData: any; customerId?: string; assetId: string };
  'rental.updated': { rentalId: string; rentalData: any };
  'rental.started': { rentalId: string; customerId: string; assetId: string; startTime: string };
  'rental.completed': { rentalId: string; customerId: string; assetId: string; endTime: string; finalCost: number };
  'rental.cancelled': { rentalId: string; customerId?: string; assetId: string; reason?: string; cancellationFee?: number };
  'rental.extended': { rentalId: string; originalEndTime: string; newEndTime: string; additionalCost: number };
  'rental.payment_processed': { rentalId: string; amount: number; paymentMethod: string; customerId?: string };
  'rental.payment_failed': { rentalId: string; amount: number; reason?: string; customerId?: string };
  'rental.asset_damaged': { rentalId: string; assetId: string; customerId: string; damageDescription: string; repairCost?: number };
  'rental.asset_returned': { rentalId: string; assetId: string; condition: 'good' | 'fair' | 'poor' | 'damaged'; notes?: string };
  'rental.overdue': { rentalId: string; customerId: string; assetId: string; overdueDays: number; lateFees: number };
  'rental.utilization_updated': { assetId: string; utilizationRate: number; revenue: number; period: string };

  // Asset Management events
  'asset.created': { assetId: string; assetData: any; category: string };
  'asset.updated': { assetId: string; assetData: any };
  'asset.condition_changed': { assetId: string; previousCondition: string; newCondition: string; reason?: string };
  'asset.maintenance_scheduled': { assetId: string; maintenanceDate: string; maintenanceType: string; cost?: number };
  'asset.maintenance_completed': { assetId: string; completionDate: string; cost: number; notes?: string };
  'asset.maintenance_overdue': { assetId: string; scheduledDate: string; overdueDays: number };
  'asset.location_changed': { assetId: string; previousLocation: string; newLocation: string; reason?: string };
  'asset.utilization_updated': { assetId: string; utilizationRate: number; revenue: number; period: string };
  'asset.depreciation_calculated': { assetId: string; currentValue: number; depreciationAmount: number; period: string };
  'asset.retired': { assetId: string; retirementDate: string; reason: string; salvageValue?: number };
  'asset.damage_reported': { assetId: string; damageDescription: string; severity: 'minor' | 'major' | 'critical'; repairCost?: number };
  'asset.warranty_expiring': { assetId: string; expirationDate: string; daysRemaining: number };

  // Advanced Reporting events
  'reporting.created': { reportId: string; reportName: string; type: string; modules: string[]; dataPoints: number };
  'reporting.updated': { reportId: string; reportName: string; changesMade: string[] };
  'reporting.generated': { reportId: string; status: 'success' | 'failed'; generationTime: string; size: string };
  'reporting.scheduled': { reportId: string; frequency: string; nextRun: string; recipients: string[] };
  'reporting.cancelled': { reportId: string; reason?: string };
  'reporting.shared': { reportId: string; sharedWith: string[]; accessLevel: 'view' | 'edit' | 'admin' };
  'reporting.exported': { reportId: string; format: string; destination: string; fileSize: string };
  'reporting.template_created': { templateId: string; templateName: string; baseReportId: string };
  'reporting.error': { reportId: string; errorMessage: string; errorType: string };
  'reporting.performance_alert': { reportId: string; metric: string; value: number; threshold: number };
  'reporting.data_source_updated': { reportId: string; modulesChanged: string[]; dataPointsAdded: number };
  'reporting.insight_generated': { reportId: string; insightType: string; confidence: number; businessValue: number };

  // Executive BI events
  'executive.nlp_query_processed': { query: string; context: string; responseType: string; processingTime: number; confidence: number };
  'executive.external_data_source_added': { sourceId: string; name: string; type: string; endpoint: string };
  'executive.external_data_synced': { sourceId: string; status: 'success' | 'error'; recordsProcessed: number; timestamp: Date };
  'executive.chart_exported': { chartId: string; format: string; timestamp: Date; fileSize: number };
  'executive.dashboard_viewed': { dashboardType: string; userId?: string; timestamp: Date };
  'executive.insight_generated': { category: string; insight: string; confidence: number; actionable: boolean };
  'executive.kpi_threshold_breached': { kpi: string; value: number; threshold: number; severity: 'warning' | 'critical' };
  'executive.forecast_updated': { metric: string; forecastPeriod: string; accuracy: number; lastUpdate: Date };

  // Analytics events
  'analytics.generated': { module: string; analyticsData: any; timestamp: string };
  'analytics.insight_created': { module: string; insight: string; priority: 'low' | 'medium' | 'high' };
  'analytics.recommendation_created': { module: string; recommendation: string; actionable: boolean };

  // System events
  'system.module_loaded': { moduleName: string; timestamp: string };
  'system.module_error': { moduleName: string; error: string; timestamp: string };
  'system.performance_alert': { module: string; metric: string; value: number; threshold: number };
}

/**
 * Type-safe event emitter wrapper
 */
class TypedEventBus {
  emit<K extends keyof ModuleEvents>(event: K, data: ModuleEvents[K]): void {
    eventBus.emit(event as EventPattern, data);
  }

  on<K extends keyof ModuleEvents>(
    event: K,
    handler: (data: ModuleEvents[K]) => void
  ): () => void {
    const unsubscribe = eventBus.on(event as EventPattern, (eventData) => {
      handler(eventData.payload);
    });
    return unsubscribe;
  }

  off<K extends keyof ModuleEvents>(
    event: K,
    handler: (data: ModuleEvents[K]) => void
  ): void {
    // EventBus off method removes all handlers for pattern if no handler specified
    eventBus.off(event as EventPattern);
  }

  once<K extends keyof ModuleEvents>(
    event: K,
    handler: (data: ModuleEvents[K]) => void
  ): void {
    eventBus.once(event as EventPattern, (eventData) => {
      handler(eventData.payload);
    });
  }
}

export const moduleEventBus = new TypedEventBus();

/**
 * Event-driven integrations between modules
 */
export class ModuleIntegrations {
  static initialize() {
    this.setupCustomerIntegrations();
    this.setupInventoryIntegrations();
    this.setupSalesIntegrations();
    this.setupBillingIntegrations();
    this.setupMembershipIntegrations();
    this.setupRentalIntegrations();
    this.setupAssetIntegrations();
    this.setupReportingIntegrations();
    this.setupExecutiveIntegrations();
    this.setupAnalyticsIntegrations();
    this.setupSystemIntegrations();
  }

  /**
   * Customer module integrations
   */
  private static setupCustomerIntegrations() {
    // When customer is created, initialize analytics
    moduleEventBus.on('customer.created', ({ customerId, customerData }) => {
      console.log(`[EventBus] Customer created: ${customerId}`);

      // Trigger customer analytics initialization
      moduleEventBus.emit('analytics.generated', {
        module: 'customers',
        analyticsData: { newCustomer: customerData },
        timestamp: new Date().toISOString()
      });
    });

    // When customer RFM is updated, notify other modules
    moduleEventBus.on('customer.rfm_updated', ({ customerId, segment, scores }) => {
      console.log(`[EventBus] Customer ${customerId} segment updated to: ${segment}`);

      if (segment === 'At Risk') {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'customers',
          insight: `Cliente ${customerId} está en riesgo de abandono`,
          priority: 'high'
        });
      }
    });
  }

  /**
   * Inventory/Materials module integrations
   */
  private static setupInventoryIntegrations() {
    // When stock goes low, notify relevant modules
    moduleEventBus.on('material.stock_low', ({ materialId, currentStock, minStock }) => {
      console.log(`[EventBus] Stock low for material ${materialId}: ${currentStock}/${minStock}`);

      moduleEventBus.emit('analytics.insight_created', {
        module: 'materials',
        insight: `Material ${materialId} necesita reposición`,
        priority: 'medium'
      });
    });

    // When stock goes critical, create high priority alerts
    moduleEventBus.on('material.stock_critical', ({ materialId, currentStock, minStock }) => {
      console.log(`[EventBus] CRITICAL stock for material ${materialId}: ${currentStock}/${minStock}`);

      moduleEventBus.emit('analytics.insight_created', {
        module: 'materials',
        insight: `¡CRÍTICO! Material ${materialId} requiere reposición inmediata`,
        priority: 'high'
      });

      // Notify other modules that might be affected
      moduleEventBus.emit('system.performance_alert', {
        module: 'inventory',
        metric: 'stock_level',
        value: currentStock,
        threshold: minStock
      });
    });

    // When materials are created, check if they affect recipes
    moduleEventBus.on('material.created', ({ materialId, materialData }) => {
      console.log(`[EventBus] New material created: ${materialId}`);

      // This would trigger recipe recalculations if needed
      moduleEventBus.emit('analytics.generated', {
        module: 'materials',
        analyticsData: { newMaterial: materialData },
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Sales module integrations
   */
  private static setupSalesIntegrations() {
    // When sale is completed, update multiple systems
    moduleEventBus.on('sale.completed', ({ saleId, total, customerId, items }) => {
      console.log(`[EventBus] Sale completed: ${saleId} for $${total}`);

      // Update customer analytics if customer is known
      if (customerId) {
        moduleEventBus.emit('customer.updated', {
          customerId,
          customerData: { lastPurchase: new Date().toISOString(), totalSpent: total }
        });
      }

      // Update inventory for sold items
      items.forEach((item: any) => {
        moduleEventBus.emit('material.stock_adjusted', {
          materialId: item.product_id,
          adjustment: -item.quantity,
          reason: `Sold in transaction ${saleId}`
        });
      });

      // Generate sales analytics update
      moduleEventBus.emit('sale.analytics_updated', {
        totalSales: total,
        averageTicket: total,
        topItems: items
      });
    });

    // When payment is processed, log for analytics
    moduleEventBus.on('sale.payment_processed', ({ saleId, paymentMethod, amount }) => {
      console.log(`[EventBus] Payment processed: ${paymentMethod} for $${amount}`);

      moduleEventBus.emit('analytics.generated', {
        module: 'sales',
        analyticsData: {
          paymentMethod,
          amount,
          transaction: saleId
        },
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Billing module integrations
   */
  private static setupBillingIntegrations() {
    // When subscription is created, update customer analytics and MRR
    moduleEventBus.on('billing.subscription_created', ({ subscriptionId, subscriptionData, customerId }) => {
      console.log(`[EventBus] Subscription created: ${subscriptionId}`);

      // Update customer data if available
      if (customerId) {
        moduleEventBus.emit('customer.updated', {
          customerId,
          customerData: { hasActiveSubscription: true, subscriptionId }
        });
      }

      // Trigger MRR calculation update
      if (subscriptionData.amount) {
        const monthlyAmount = subscriptionData.billingType === 'monthly' ? subscriptionData.amount :
                             subscriptionData.billingType === 'quarterly' ? subscriptionData.amount / 3 :
                             subscriptionData.billingType === 'annual' ? subscriptionData.amount / 12 :
                             subscriptionData.amount;

        moduleEventBus.emit('analytics.generated', {
          module: 'billing',
          analyticsData: {
            subscriptionCreated: subscriptionData,
            mrrImpact: monthlyAmount
          },
          timestamp: new Date().toISOString()
        });
      }
    });

    // When subscription is cancelled, update customer and create churn analytics
    moduleEventBus.on('billing.subscription_cancelled', ({ subscriptionId, reason, customerId }) => {
      console.log(`[EventBus] Subscription cancelled: ${subscriptionId}, reason: ${reason}`);

      if (customerId) {
        // Update customer status
        moduleEventBus.emit('customer.updated', {
          customerId,
          customerData: { hasActiveSubscription: false, churnReason: reason }
        });

        // Create churn analytics
        moduleEventBus.emit('analytics.insight_created', {
          module: 'billing',
          insight: `Cliente ${customerId} canceló suscripción ${subscriptionId}${reason ? ` por: ${reason}` : ''}`,
          priority: 'high'
        });
      }
    });

    // When payment fails, create risk alerts and schedule retries
    moduleEventBus.on('billing.payment_failed', ({ subscriptionId, invoiceId, attempt, reason }) => {
      console.log(`[EventBus] Payment failed: ${invoiceId}, attempt ${attempt}, reason: ${reason}`);

      // Create analytics insight for failed payment
      moduleEventBus.emit('analytics.insight_created', {
        module: 'billing',
        insight: `Fallo de pago en factura ${invoiceId} (intento ${attempt}) - ${reason}`,
        priority: attempt >= 3 ? 'high' : 'medium'
      });

      // If multiple failures, detect churn risk
      if (attempt >= 3) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'billing',
          insight: `Riesgo crítico de abandono para suscripción ${subscriptionId}`,
          priority: 'high'
        });
      }
    });

    // When payment succeeds after failure, create success analytics
    moduleEventBus.on('billing.payment_succeeded', ({ subscriptionId, invoiceId, amount, customerId }) => {
      console.log(`[EventBus] Payment succeeded: ${invoiceId} for $${amount}`);

      // Update customer analytics with successful payment
      if (customerId) {
        moduleEventBus.emit('customer.updated', {
          customerId,
          customerData: { lastPayment: new Date().toISOString(), lastAmount: amount }
        });
      }

      // Generate revenue analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'billing',
        analyticsData: {
          paymentSucceeded: { subscriptionId, amount },
          revenueRecognized: amount
        },
        timestamp: new Date().toISOString()
      });
    });

    // When churn risk is detected, create targeted interventions
    moduleEventBus.on('billing.churn_risk_detected', ({ customerId, subscriptionId, riskLevel }) => {
      console.log(`[EventBus] Churn risk detected: ${customerId}, level: ${riskLevel}`);

      // Create high-priority insight for intervention
      moduleEventBus.emit('analytics.insight_created', {
        module: 'billing',
        insight: `Cliente ${customerId} presenta riesgo ${riskLevel} de abandono`,
        priority: riskLevel === 'high' ? 'high' : 'medium'
      });

      // If high risk, create actionable recommendation
      if (riskLevel === 'high') {
        moduleEventBus.emit('analytics.recommendation_created', {
          module: 'billing',
          recommendation: `Contactar inmediatamente al cliente ${customerId} para retención`,
          actionable: true
        });
      }
    });

    // When MRR is updated, track business growth
    moduleEventBus.on('billing.mrr_updated', ({ previousMrr, currentMrr, change, timestamp }) => {
      console.log(`[EventBus] MRR updated: $${currentMrr} (${change > 0 ? '+' : ''}${change})`);

      // Generate growth analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'billing',
        analyticsData: {
          mrrGrowth: {
            previous: previousMrr,
            current: currentMrr,
            change,
            changePercent: ((change / previousMrr) * 100).toFixed(2)
          }
        },
        timestamp
      });

      // Create insights based on growth trends
      if (change > 0) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'billing',
          insight: `MRR creció $${change.toLocaleString()} este período`,
          priority: 'medium'
        });
      } else if (change < 0) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'billing',
          insight: `MRR decreció $${Math.abs(change).toLocaleString()} - revisar cancelaciones`,
          priority: 'high'
        });
      }
    });

    // When dunning is triggered, coordinate with customer service
    moduleEventBus.on('billing.dunning_triggered', ({ subscriptionId, customerId, overdueDays }) => {
      console.log(`[EventBus] Dunning triggered for customer ${customerId}, ${overdueDays} days overdue`);

      // Create customer service alert
      moduleEventBus.emit('analytics.recommendation_created', {
        module: 'billing',
        recommendation: `Iniciar proceso de cobranza para cliente ${customerId} (${overdueDays} días vencido)`,
        actionable: true
      });

      // Update customer risk profile
      moduleEventBus.emit('customer.updated', {
        customerId,
        customerData: {
          paymentRisk: overdueDays > 30 ? 'high' : 'medium',
          lastDunningDate: new Date().toISOString()
        }
      });
    });
  }

  /**
   * Membership module integrations
   */
  private static setupMembershipIntegrations() {
    // When membership is created, update customer data and create billing if needed
    moduleEventBus.on('membership.created', ({ membershipId, membershipData, customerId }) => {
      console.log(`[EventBus] Membership created: ${membershipId}`);

      // Update customer data with membership info
      if (customerId) {
        moduleEventBus.emit('customer.updated', {
          customerId,
          customerData: {
            membershipId,
            membershipType: membershipData.membershipType,
            membershipStatus: 'active',
            joinDate: new Date().toISOString()
          }
        });
      }

      // Create analytics for new membership
      moduleEventBus.emit('analytics.generated', {
        module: 'membership',
        analyticsData: {
          membershipCreated: membershipData,
          membershipValue: membershipData.fees?.monthlyFee || 0,
          projectedLTV: membershipData.projectedLTV
        },
        timestamp: new Date().toISOString()
      });

      // If auto-renewal enabled, integrate with billing
      if (membershipData.autoRenewal && membershipData.fees?.monthlyFee > 0 && customerId) {
        moduleEventBus.emit('billing.subscription_created', {
          subscriptionId: `sub_${membershipId}`,
          subscriptionData: {
            amount: membershipData.fees.monthlyFee,
            billingType: membershipData.billingCycle,
            description: `${membershipData.membershipType} membership`,
            membershipId
          },
          customerId
        });
      }
    });

    // When membership is cancelled, update customer and billing
    moduleEventBus.on('membership.cancelled', ({ membershipId, customerId, reason }) => {
      console.log(`[EventBus] Membership cancelled: ${membershipId}, reason: ${reason}`);

      // Update customer status
      moduleEventBus.emit('customer.updated', {
        customerId,
        customerData: {
          membershipStatus: 'cancelled',
          cancellationReason: reason,
          cancellationDate: new Date().toISOString()
        }
      });

      // Create churn analytics
      moduleEventBus.emit('analytics.insight_created', {
        module: 'membership',
        insight: `Miembro ${customerId} canceló membresía ${membershipId}${reason ? ` por: ${reason}` : ''}`,
        priority: 'high'
      });

      // Cancel associated billing subscription if exists
      moduleEventBus.emit('billing.subscription_cancelled', {
        subscriptionId: `sub_${membershipId}`,
        reason: `Membership cancellation: ${reason}`,
        customerId
      });
    });

    // When member visits facility, track engagement and analytics
    moduleEventBus.on('membership.visit_logged', ({ membershipId, customerId, facility, duration }) => {
      console.log(`[EventBus] Member visit logged: ${customerId} at ${facility} for ${duration} min`);

      // Update customer engagement data
      moduleEventBus.emit('customer.updated', {
        customerId,
        customerData: {
          lastVisit: new Date().toISOString(),
          lastFacilityUsed: facility,
          totalVisitsThisMonth: '+1' // Increment counter
        }
      });

      // Generate engagement analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'membership',
        analyticsData: {
          visitLogged: {
            membershipId,
            facility,
            duration,
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });
    });

    // When churn risk is detected, create intervention strategies
    moduleEventBus.on('membership.churn_risk_detected', ({ membershipId, customerId, riskLevel, inactivityDays }) => {
      console.log(`[EventBus] Membership churn risk detected: ${customerId}, level: ${riskLevel}, inactive for ${inactivityDays} days`);

      // Create high-priority insight for retention
      moduleEventBus.emit('analytics.insight_created', {
        module: 'membership',
        insight: `Miembro ${customerId} presenta riesgo ${riskLevel} de abandono (${inactivityDays} días inactivo)`,
        priority: riskLevel === 'high' ? 'high' : 'medium'
      });

      // Update customer risk profile
      moduleEventBus.emit('customer.updated', {
        customerId,
        customerData: {
          churnRisk: riskLevel,
          inactivityDays,
          lastRiskAssessment: new Date().toISOString()
        }
      });

      // If high risk, create actionable recommendations
      if (riskLevel === 'high') {
        moduleEventBus.emit('analytics.recommendation_created', {
          module: 'membership',
          recommendation: `Contactar inmediatamente al miembro ${customerId} para reactivación (${inactivityDays} días sin visitas)`,
          actionable: true
        });
      }

      // Create targeted re-engagement strategy
      if (inactivityDays > 14) {
        moduleEventBus.emit('analytics.recommendation_created', {
          module: 'membership',
          recommendation: `Ofrecer clase gratuita o descuento temporal para miembro ${customerId}`,
          actionable: true
        });
      }
    });

    // When membership expires, handle renewal or termination
    moduleEventBus.on('membership.expired', ({ membershipId, customerId, expiredDate }) => {
      console.log(`[EventBus] Membership expired: ${membershipId} on ${expiredDate}`);

      // Update customer status
      moduleEventBus.emit('customer.updated', {
        customerId,
        customerData: {
          membershipStatus: 'expired',
          expirationDate: expiredDate
        }
      });

      // Create renewal opportunity insight
      moduleEventBus.emit('analytics.insight_created', {
        module: 'membership',
        insight: `Membresía ${membershipId} venció - oportunidad de renovación para ${customerId}`,
        priority: 'medium'
      });

      // Create renewal recommendation
      moduleEventBus.emit('analytics.recommendation_created', {
        module: 'membership',
        recommendation: `Contactar a ${customerId} para renovación de membresía con oferta especial`,
        actionable: true
      });
    });

    // When upgrade is requested, handle cross-selling opportunity
    moduleEventBus.on('membership.upgrade_requested', ({ membershipId, customerId, fromType, toType }) => {
      console.log(`[EventBus] Membership upgrade requested: ${customerId} from ${fromType} to ${toType}`);

      // Update customer data with upgrade intent
      moduleEventBus.emit('customer.updated', {
        customerId,
        customerData: {
          upgradeIntent: toType,
          upgradeRequestDate: new Date().toISOString()
        }
      });

      // Create upselling analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'membership',
        analyticsData: {
          upgradeRequested: {
            membershipId,
            fromType,
            toType,
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });

      // Create high-value insight
      moduleEventBus.emit('analytics.insight_created', {
        module: 'membership',
        insight: `Miembro ${customerId} solicita upgrade de ${fromType} a ${toType} - oportunidad de alto valor`,
        priority: 'high'
      });
    });

    // When engagement score is updated, track member satisfaction
    moduleEventBus.on('membership.engagement_score_updated', ({ membershipId, customerId, score, previousScore }) => {
      console.log(`[EventBus] Engagement score updated: ${customerId} from ${previousScore} to ${score}`);

      const scoreChange = score - previousScore;

      // Update customer engagement profile
      moduleEventBus.emit('customer.updated', {
        customerId,
        customerData: {
          engagementScore: score,
          engagementTrend: scoreChange > 0 ? 'improving' : scoreChange < 0 ? 'declining' : 'stable'
        }
      });

      // Generate engagement analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'membership',
        analyticsData: {
          engagementUpdate: {
            membershipId,
            score,
            change: scoreChange,
            trend: scoreChange > 0 ? 'up' : scoreChange < 0 ? 'down' : 'stable'
          }
        },
        timestamp: new Date().toISOString()
      });

      // Alert on significant score drops
      if (scoreChange < -10) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'membership',
          insight: `Score de engagement de ${customerId} bajó ${Math.abs(scoreChange)} puntos - riesgo de churn`,
          priority: 'high'
        });
      }
    });

    // When payment is overdue, coordinate with billing and create urgency
    moduleEventBus.on('membership.payment_overdue', ({ membershipId, customerId, overdueDays, amount }) => {
      console.log(`[EventBus] Membership payment overdue: ${customerId}, ${overdueDays} days, $${amount}`);

      // Update customer payment status
      moduleEventBus.emit('customer.updated', {
        customerId,
        customerData: {
          paymentStatus: 'overdue',
          overdueAmount: amount,
          overdueDays
        }
      });

      // Trigger billing dunning process
      moduleEventBus.emit('billing.dunning_triggered', {
        subscriptionId: `sub_${membershipId}`,
        customerId,
        overdueDays
      });

      // Create payment recovery insight
      moduleEventBus.emit('analytics.insight_created', {
        module: 'membership',
        insight: `Pago de membresía vencido para ${customerId}: $${amount} (${overdueDays} días)`,
        priority: overdueDays > 30 ? 'high' : 'medium'
      });

      // If severely overdue, consider suspension
      if (overdueDays > 30) {
        moduleEventBus.emit('analytics.recommendation_created', {
          module: 'membership',
          recommendation: `Suspender membresía ${membershipId} por pago vencido (${overdueDays} días)`,
          actionable: true
        });
      }
    });
  }

  /**
   * Rental module integrations
   */
  private static setupRentalIntegrations() {
    // When rental is created, update customer data and track asset utilization
    moduleEventBus.on('rental.created', ({ rentalId, rentalData, customerId, assetId }) => {
      console.log(`[EventBus] Rental created: ${rentalId} for asset ${assetId}`);

      // Update customer data with rental history
      if (customerId) {
        moduleEventBus.emit('customer.updated', {
          customerId,
          customerData: {
            lastRental: new Date().toISOString(),
            rentalHistory: '+1',
            preferredAssetType: rentalData.rentalType
          }
        });
      }

      // Generate rental analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'rental',
        analyticsData: {
          rentalCreated: rentalData,
          totalValue: rentalData.totalAmount || 0,
          assetUtilization: { assetId, rentalId }
        },
        timestamp: new Date().toISOString()
      });

      // If corporate customer with recurring rentals, suggest billing setup
      if (rentalData.customerInfo?.customerType === 'corporate' && rentalData.totalAmount > 1000) {
        moduleEventBus.emit('analytics.recommendation_created', {
          module: 'rental',
          recommendation: `Considerar suscripción billing para cliente corporativo ${customerId} - rental alto valor`,
          actionable: true
        });
      }
    });

    // When rental starts, track asset status and utilization
    moduleEventBus.on('rental.started', ({ rentalId, customerId, assetId, startTime }) => {
      console.log(`[EventBus] Rental started: ${rentalId} for asset ${assetId}`);

      // Update customer engagement
      moduleEventBus.emit('customer.updated', {
        customerId,
        customerData: {
          currentRentals: '+1',
          lastActivityDate: startTime
        }
      });

      // Generate asset utilization analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'rental',
        analyticsData: {
          assetUtilizationStart: {
            assetId,
            rentalId,
            startTime
          }
        },
        timestamp: new Date().toISOString()
      });
    });

    // When rental is completed, process final analytics and update customer value
    moduleEventBus.on('rental.completed', ({ rentalId, customerId, assetId, endTime, finalCost }) => {
      console.log(`[EventBus] Rental completed: ${rentalId}, final cost: $${finalCost}`);

      // Update customer lifetime value and rental statistics
      moduleEventBus.emit('customer.updated', {
        customerId,
        customerData: {
          totalRentalValue: `+${finalCost}`,
          completedRentals: '+1',
          currentRentals: '-1',
          lastCompletedRental: endTime
        }
      });

      // Generate revenue and completion analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'rental',
        analyticsData: {
          rentalCompleted: {
            rentalId,
            assetId,
            revenue: finalCost,
            endTime
          }
        },
        timestamp: new Date().toISOString()
      });

      // Process payment automatically if setup
      moduleEventBus.emit('rental.payment_processed', {
        rentalId,
        amount: finalCost,
        paymentMethod: 'auto',
        customerId
      });

      // Create customer satisfaction insight
      moduleEventBus.emit('analytics.insight_created', {
        module: 'rental',
        insight: `Rental ${rentalId} completado exitosamente - oportunidad para feedback y upselling`,
        priority: 'medium'
      });
    });

    // When rental is cancelled, track reasons and manage asset availability
    moduleEventBus.on('rental.cancelled', ({ rentalId, customerId, assetId, reason, cancellationFee }) => {
      console.log(`[EventBus] Rental cancelled: ${rentalId}, reason: ${reason}`);

      // Update customer cancellation data
      if (customerId) {
        moduleEventBus.emit('customer.updated', {
          customerId,
          customerData: {
            cancelledRentals: '+1',
            lastCancellationReason: reason,
            currentRentals: '-1'
          }
        });
      }

      // Generate cancellation analytics
      moduleEventBus.emit('analytics.insight_created', {
        module: 'rental',
        insight: `Rental ${rentalId} cancelado${reason ? ` por: ${reason}` : ''} - analizar patrón de cancelaciones`,
        priority: 'medium'
      });

      // If cancellation fee applied, process billing
      if (cancellationFee && cancellationFee > 0 && customerId) {
        moduleEventBus.emit('rental.payment_processed', {
          rentalId,
          amount: cancellationFee,
          paymentMethod: 'penalty',
          customerId
        });
      }

      // Create asset availability update
      moduleEventBus.emit('analytics.generated', {
        module: 'rental',
        analyticsData: {
          assetReleased: { assetId, rentalId, reason }
        },
        timestamp: new Date().toISOString()
      });
    });

    // When asset is damaged, coordinate with customer service and maintenance
    moduleEventBus.on('rental.asset_damaged', ({ rentalId, assetId, customerId, damageDescription, repairCost }) => {
      console.log(`[EventBus] Asset damaged: ${assetId} in rental ${rentalId}`);

      // Update customer damage history
      moduleEventBus.emit('customer.updated', {
        customerId,
        customerData: {
          damageHistory: '+1',
          lastDamageIncident: new Date().toISOString(),
          totalDamageCost: `+${repairCost || 0}`
        }
      });

      // Create high-priority damage alert
      moduleEventBus.emit('analytics.insight_created', {
        module: 'rental',
        insight: `Asset ${assetId} dañado por ${customerId}: ${damageDescription}${repairCost ? ` - Costo: $${repairCost}` : ''}`,
        priority: 'high'
      });

      // If significant damage, create billing for repair
      if (repairCost && repairCost > 100) {
        moduleEventBus.emit('rental.payment_processed', {
          rentalId,
          amount: repairCost,
          paymentMethod: 'damage_fee',
          customerId
        });
      }

      // Create maintenance recommendation
      moduleEventBus.emit('analytics.recommendation_created', {
        module: 'rental',
        recommendation: `Programar mantenimiento para asset ${assetId} - ${damageDescription}`,
        actionable: true
      });
    });

    // When rental is overdue, coordinate with billing and customer management
    moduleEventBus.on('rental.overdue', ({ rentalId, customerId, assetId, overdueDays, lateFees }) => {
      console.log(`[EventBus] Rental overdue: ${rentalId}, ${overdueDays} days, fees: $${lateFees}`);

      // Update customer overdue status
      moduleEventBus.emit('customer.updated', {
        customerId,
        customerData: {
          overdueRentals: '+1',
          totalLateFees: `+${lateFees}`,
          reliability: overdueDays > 7 ? 'low' : 'medium'
        }
      });

      // Trigger billing collection
      moduleEventBus.emit('billing.dunning_triggered', {
        subscriptionId: `rental_${rentalId}`,
        customerId,
        overdueDays
      });

      // Create overdue analytics
      moduleEventBus.emit('analytics.insight_created', {
        module: 'rental',
        insight: `Rental ${rentalId} vencido ${overdueDays} días - Asset ${assetId} bloqueado`,
        priority: 'high'
      });

      // If severely overdue, create intervention
      if (overdueDays > 14) {
        moduleEventBus.emit('analytics.recommendation_created', {
          module: 'rental',
          recommendation: `Contacto urgente con ${customerId} para recuperación de asset ${assetId}`,
          actionable: true
        });
      }
    });

    // When asset utilization is updated, track performance metrics
    moduleEventBus.on('rental.utilization_updated', ({ assetId, utilizationRate, revenue, period }) => {
      console.log(`[EventBus] Asset utilization updated: ${assetId}, ${utilizationRate}% for ${period}`);

      // Generate utilization analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'rental',
        analyticsData: {
          assetPerformance: {
            assetId,
            utilizationRate,
            revenue,
            period,
            efficiency: utilizationRate > 80 ? 'high' : utilizationRate > 60 ? 'medium' : 'low'
          }
        },
        timestamp: new Date().toISOString()
      });

      // Create insights based on utilization
      if (utilizationRate > 90) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'rental',
          insight: `Asset ${assetId} con alta demanda (${utilizationRate}%) - considerar expansión de inventario`,
          priority: 'medium'
        });
      } else if (utilizationRate < 30) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'rental',
          insight: `Asset ${assetId} con baja utilización (${utilizationRate}%) - revisar pricing o marketing`,
          priority: 'medium'
        });
      }
    });

    // When payment is processed, update customer payment history
    moduleEventBus.on('rental.payment_processed', ({ rentalId, amount, paymentMethod, customerId }) => {
      console.log(`[EventBus] Rental payment processed: ${rentalId}, $${amount} via ${paymentMethod}`);

      if (customerId) {
        // Update customer payment profile
        moduleEventBus.emit('customer.updated', {
          customerId,
          customerData: {
            totalRentalPayments: `+${amount}`,
            lastPaymentDate: new Date().toISOString(),
            preferredPaymentMethod: paymentMethod,
            paymentReliability: 'good'
          }
        });

        // Generate payment analytics
        moduleEventBus.emit('analytics.generated', {
          module: 'rental',
          analyticsData: {
            paymentProcessed: {
              rentalId,
              amount,
              paymentMethod,
              customerId
            }
          },
          timestamp: new Date().toISOString()
        });
      }
    });

    // When payment fails, create alerts and coordinate recovery
    moduleEventBus.on('rental.payment_failed', ({ rentalId, amount, reason, customerId }) => {
      console.log(`[EventBus] Rental payment failed: ${rentalId}, $${amount}, reason: ${reason}`);

      if (customerId) {
        // Update customer payment issues
        moduleEventBus.emit('customer.updated', {
          customerId,
          customerData: {
            failedPayments: '+1',
            paymentReliability: 'poor',
            lastPaymentFailure: new Date().toISOString()
          }
        });

        // Create payment recovery alert
        moduleEventBus.emit('analytics.insight_created', {
          module: 'rental',
          insight: `Pago fallido para rental ${rentalId}: $${amount} - ${reason}`,
          priority: 'high'
        });

        // Trigger billing collection
        moduleEventBus.emit('billing.payment_failed', {
          subscriptionId: `rental_${rentalId}`,
          invoiceId: `invoice_${rentalId}`,
          attempt: 1,
          reason
        });
      }
    });
  }

  /**
   * Asset module integrations
   */
  private static setupAssetIntegrations() {
    // When asset is created, initialize tracking and analytics
    moduleEventBus.on('asset.created', ({ assetId, assetData, category }) => {
      console.log(`[EventBus] Asset created: ${assetId} in category ${category}`);

      // Generate portfolio analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'asset',
        analyticsData: {
          assetCreated: assetData,
          portfolioValue: assetData.financial?.purchasePrice || 0,
          category
        },
        timestamp: new Date().toISOString()
      });

      // Create asset insight
      moduleEventBus.emit('analytics.insight_created', {
        module: 'asset',
        insight: `Nuevo asset ${assetId} agregado al portfolio - Categoría: ${category}`,
        priority: 'medium'
      });

      // If high-value asset, create special tracking
      if (assetData.financial?.purchasePrice > 50000) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'asset',
          insight: `Asset de alto valor ${assetId} ($${assetData.financial.purchasePrice.toLocaleString()}) - Activar tracking especial`,
          priority: 'high'
        });
      }
    });

    // When asset condition changes, update maintenance and rental availability
    moduleEventBus.on('asset.condition_changed', ({ assetId, previousCondition, newCondition, reason }) => {
      console.log(`[EventBus] Asset condition changed: ${assetId} from ${previousCondition} to ${newCondition}`);

      // Generate condition analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'asset',
        analyticsData: {
          conditionChange: {
            assetId,
            previousCondition,
            newCondition,
            reason,
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });

      // Create alerts based on condition deterioration
      if ((previousCondition === 'excellent' && newCondition !== 'excellent') ||
          (previousCondition === 'good' && ['fair', 'poor', 'damaged'].includes(newCondition))) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'asset',
          insight: `Deterioro de condición en asset ${assetId}: ${previousCondition} → ${newCondition}${reason ? ` (${reason})` : ''}`,
          priority: newCondition === 'damaged' ? 'high' : 'medium'
        });
      }

      // If asset becomes unavailable, coordinate with rental module
      if (['damaged', 'out_of_service'].includes(newCondition)) {
        moduleEventBus.emit('analytics.recommendation_created', {
          module: 'asset',
          recommendation: `Suspender disponibilidad de rental para asset ${assetId} hasta reparación`,
          actionable: true
        });
      }
    });

    // When maintenance is scheduled, coordinate with operations
    moduleEventBus.on('asset.maintenance_scheduled', ({ assetId, maintenanceDate, maintenanceType, cost }) => {
      console.log(`[EventBus] Maintenance scheduled: ${assetId} on ${maintenanceDate}`);

      // Generate maintenance analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'asset',
        analyticsData: {
          maintenanceScheduled: {
            assetId,
            maintenanceDate,
            maintenanceType,
            cost: cost || 0
          }
        },
        timestamp: new Date().toISOString()
      });

      // Create operational recommendation
      moduleEventBus.emit('analytics.recommendation_created', {
        module: 'asset',
        recommendation: `Bloquear rental de asset ${assetId} para ${maintenanceDate} - ${maintenanceType}`,
        actionable: true
      });

      // If high-cost maintenance, create budget alert
      if (cost && cost > 5000) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'asset',
          insight: `Mantenimiento de alto costo programado: ${assetId} - $${cost.toLocaleString()}`,
          priority: 'high'
        });
      }
    });

    // When maintenance is completed, update asset status and costs
    moduleEventBus.on('asset.maintenance_completed', ({ assetId, completionDate, cost, notes }) => {
      console.log(`[EventBus] Maintenance completed: ${assetId}, cost: $${cost}`);

      // Update asset condition tracking
      moduleEventBus.emit('asset.condition_changed', {
        assetId,
        previousCondition: 'maintenance',
        newCondition: 'good',
        reason: 'Maintenance completed'
      });

      // Generate maintenance completion analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'asset',
        analyticsData: {
          maintenanceCompleted: {
            assetId,
            completionDate,
            cost,
            notes
          }
        },
        timestamp: new Date().toISOString()
      });

      // Create availability update
      moduleEventBus.emit('analytics.insight_created', {
        module: 'asset',
        insight: `Asset ${assetId} disponible post-mantenimiento - Costo: $${cost.toLocaleString()}`,
        priority: 'medium'
      });
    });

    // When maintenance is overdue, create urgent alerts
    moduleEventBus.on('asset.maintenance_overdue', ({ assetId, scheduledDate, overdueDays }) => {
      console.log(`[EventBus] Maintenance overdue: ${assetId}, ${overdueDays} days`);

      // Create high-priority maintenance alert
      moduleEventBus.emit('analytics.insight_created', {
        module: 'asset',
        insight: `Mantenimiento vencido para asset ${assetId}: ${overdueDays} días desde ${scheduledDate}`,
        priority: 'high'
      });

      // If severely overdue, recommend service suspension
      if (overdueDays > 30) {
        moduleEventBus.emit('analytics.recommendation_created', {
          module: 'asset',
          recommendation: `Suspender uso de asset ${assetId} hasta completar mantenimiento vencido`,
          actionable: true
        });
      }

      // Update asset risk profile
      moduleEventBus.emit('analytics.generated', {
        module: 'asset',
        analyticsData: {
          maintenanceRisk: {
            assetId,
            overdueDays,
            riskLevel: overdueDays > 30 ? 'high' : overdueDays > 14 ? 'medium' : 'low'
          }
        },
        timestamp: new Date().toISOString()
      });
    });

    // When asset utilization is updated, track performance metrics
    moduleEventBus.on('asset.utilization_updated', ({ assetId, utilizationRate, revenue, period }) => {
      console.log(`[EventBus] Asset utilization updated: ${assetId}, ${utilizationRate}% for ${period}`);

      // Generate utilization analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'asset',
        analyticsData: {
          utilizationUpdate: {
            assetId,
            utilizationRate,
            revenue,
            period,
            performance: utilizationRate > 80 ? 'excellent' : utilizationRate > 60 ? 'good' : 'poor'
          }
        },
        timestamp: new Date().toISOString()
      });

      // Create performance insights
      if (utilizationRate > 95) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'asset',
          insight: `Asset ${assetId} con utilización excepcional (${utilizationRate}%) - Considerar duplicar inventario`,
          priority: 'medium'
        });
      } else if (utilizationRate < 30) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'asset',
          insight: `Asset ${assetId} con baja utilización (${utilizationRate}%) - Revisar pricing o marketing`,
          priority: 'medium'
        });
      }
    });

    // When depreciation is calculated, update financial tracking
    moduleEventBus.on('asset.depreciation_calculated', ({ assetId, currentValue, depreciationAmount, period }) => {
      console.log(`[EventBus] Depreciation calculated: ${assetId}, $${depreciationAmount} for ${period}`);

      // Generate financial analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'asset',
        analyticsData: {
          depreciation: {
            assetId,
            currentValue,
            depreciationAmount,
            period
          }
        },
        timestamp: new Date().toISOString()
      });

      // Create replacement planning insights
      if (currentValue < depreciationAmount * 2) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'asset',
          insight: `Asset ${assetId} acercándose a fin de vida útil - Planificar reemplazo`,
          priority: 'medium'
        });
      }
    });

    // When asset is retired, finalize analytics and coordination
    moduleEventBus.on('asset.retired', ({ assetId, retirementDate, reason, salvageValue }) => {
      console.log(`[EventBus] Asset retired: ${assetId}, reason: ${reason}`);

      // Generate retirement analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'asset',
        analyticsData: {
          assetRetired: {
            assetId,
            retirementDate,
            reason,
            salvageValue: salvageValue || 0
          }
        },
        timestamp: new Date().toISOString()
      });

      // Create portfolio adjustment insight
      moduleEventBus.emit('analytics.insight_created', {
        module: 'asset',
        insight: `Asset ${assetId} retirado del portfolio - Razón: ${reason}${salvageValue ? `, Valor rescate: $${salvageValue.toLocaleString()}` : ''}`,
        priority: 'medium'
      });

      // If early retirement, analyze causes
      if (reason.includes('damage') || reason.includes('failure')) {
        moduleEventBus.emit('analytics.recommendation_created', {
          module: 'asset',
          recommendation: `Analizar causas de retiro temprano de asset ${assetId} para prevenir recurrencia`,
          actionable: true
        });
      }
    });

    // When damage is reported, coordinate with rental and maintenance
    moduleEventBus.on('asset.damage_reported', ({ assetId, damageDescription, severity, repairCost }) => {
      console.log(`[EventBus] Asset damage reported: ${assetId}, severity: ${severity}`);

      // Update asset condition based on damage severity
      const newCondition = severity === 'critical' ? 'out_of_service' :
                          severity === 'major' ? 'damaged' : 'fair';

      moduleEventBus.emit('asset.condition_changed', {
        assetId,
        previousCondition: 'good',
        newCondition,
        reason: `Damage reported: ${damageDescription}`
      });

      // Create damage alert
      moduleEventBus.emit('analytics.insight_created', {
        module: 'asset',
        insight: `Daño ${severity} reportado en asset ${assetId}: ${damageDescription}${repairCost ? ` - Costo estimado: $${repairCost.toLocaleString()}` : ''}`,
        priority: severity === 'critical' ? 'high' : 'medium'
      });

      // If rental in progress, coordinate with rental module
      moduleEventBus.emit('analytics.recommendation_created', {
        module: 'asset',
        recommendation: `Verificar rentals activos de asset ${assetId} y coordinar retorno/reemplazo`,
        actionable: true
      });

      // If significant repair cost, create budget alert
      if (repairCost && repairCost > 10000) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'asset',
          insight: `Costo de reparación significativo para asset ${assetId}: $${repairCost.toLocaleString()} - Evaluar reemplazo`,
          priority: 'high'
        });
      }
    });

    // When warranty is expiring, create proactive alerts
    moduleEventBus.on('asset.warranty_expiring', ({ assetId, expirationDate, daysRemaining }) => {
      console.log(`[EventBus] Warranty expiring: ${assetId}, ${daysRemaining} days remaining`);

      // Create warranty expiration alert
      moduleEventBus.emit('analytics.insight_created', {
        module: 'asset',
        insight: `Garantía de asset ${assetId} vence en ${daysRemaining} días (${expirationDate})`,
        priority: daysRemaining < 30 ? 'high' : 'medium'
      });

      // Create proactive maintenance recommendation
      if (daysRemaining < 60) {
        moduleEventBus.emit('analytics.recommendation_created', {
          module: 'asset',
          recommendation: `Programar inspección completa de asset ${assetId} antes de vencimiento de garantía`,
          actionable: true
        });
      }

      // Generate warranty analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'asset',
        analyticsData: {
          warrantyExpiring: {
            assetId,
            expirationDate,
            daysRemaining
          }
        },
        timestamp: new Date().toISOString()
      });
    });

    // When asset location changes, update tracking and coordination
    moduleEventBus.on('asset.location_changed', ({ assetId, previousLocation, newLocation, reason }) => {
      console.log(`[EventBus] Asset location changed: ${assetId} from ${previousLocation} to ${newLocation}`);

      // Generate location tracking analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'asset',
        analyticsData: {
          locationChange: {
            assetId,
            previousLocation,
            newLocation,
            reason,
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });

      // If moved for rental, coordinate with rental module
      if (reason?.includes('rental')) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'asset',
          insight: `Asset ${assetId} movido para rental: ${previousLocation} → ${newLocation}`,
          priority: 'low'
        });
      }

      // If unexpected location change, create security alert
      if (!reason || reason.includes('unknown')) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'asset',
          insight: `Cambio de ubicación no autorizado para asset ${assetId}: ${previousLocation} → ${newLocation}`,
          priority: 'high'
        });
      }
    });
  }

  /**
   * Reporting module integrations
   */
  private static setupReportingIntegrations() {
    // When report is created, initialize tracking and setup data sources
    moduleEventBus.on('reporting.created', ({ reportId, reportName, type, modules, dataPoints }) => {
      console.log(`[EventBus] Report created: ${reportId} (${type}) with ${dataPoints} data points`);

      // Generate creation analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'reporting',
        analyticsData: {
          reportCreated: {
            reportId,
            reportName,
            type,
            modules,
            dataPoints,
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });

      // Create setup insights based on complexity
      if (modules.length > 5) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'reporting',
          insight: `Reporte complejo ${reportName} creado con ${modules.length} módulos - Monitorear performance`,
          priority: 'medium'
        });
      }

      // If executive report, create high-priority tracking
      if (type === 'executive') {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'reporting',
          insight: `Reporte ejecutivo ${reportName} creado - Asegurar alta calidad de datos`,
          priority: 'high'
        });
      }
    });

    // When report is generated, track performance and success metrics
    moduleEventBus.on('reporting.generated', ({ reportId, status, generationTime, size }) => {
      console.log(`[EventBus] Report generated: ${reportId}, status: ${status}, time: ${generationTime}`);

      // Generate performance analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'reporting',
        analyticsData: {
          reportGenerated: {
            reportId,
            status,
            generationTime,
            size,
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });

      // Create performance alerts for slow generation
      const timeInSeconds = parseFloat(generationTime.replace(/[^\d.]/g, ''));
      if (timeInSeconds > 300) { // 5 minutes
        moduleEventBus.emit('analytics.insight_created', {
          module: 'reporting',
          insight: `Reporte ${reportId} generó en ${generationTime} - Optimizar performance`,
          priority: 'medium'
        });
      }

      // Alert on generation failures
      if (status === 'failed') {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'reporting',
          insight: `Fallo en generación de reporte ${reportId} - Revisar fuentes de datos`,
          priority: 'high'
        });
      }

      // Track successful completions
      if (status === 'success') {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'reporting',
          insight: `Reporte ${reportId} generado exitosamente (${size}) en ${generationTime}`,
          priority: 'low'
        });
      }
    });

    // When report is scheduled, coordinate with system and notifications
    moduleEventBus.on('reporting.scheduled', ({ reportId, frequency, nextRun, recipients }) => {
      console.log(`[EventBus] Report scheduled: ${reportId}, frequency: ${frequency}, next: ${nextRun}`);

      // Generate scheduling analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'reporting',
        analyticsData: {
          reportScheduled: {
            reportId,
            frequency,
            nextRun,
            recipientCount: recipients.length
          }
        },
        timestamp: new Date().toISOString()
      });

      // Create automation insights
      moduleEventBus.emit('analytics.insight_created', {
        module: 'reporting',
        insight: `Reporte ${reportId} programado ${frequency} para ${recipients.length} destinatarios`,
        priority: 'medium'
      });

      // If many recipients, suggest optimization
      if (recipients.length > 20) {
        moduleEventBus.emit('analytics.recommendation_created', {
          module: 'reporting',
          recommendation: `Considerar distribución por lotes para reporte ${reportId} (${recipients.length} destinatarios)`,
          actionable: true
        });
      }
    });

    // When report is shared, track collaboration and access patterns
    moduleEventBus.on('reporting.shared', ({ reportId, sharedWith, accessLevel }) => {
      console.log(`[EventBus] Report shared: ${reportId} with ${sharedWith.length} users (${accessLevel} access)`);

      // Generate sharing analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'reporting',
        analyticsData: {
          reportShared: {
            reportId,
            sharedWith: sharedWith.length,
            accessLevel,
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });

      // Track collaboration patterns
      moduleEventBus.emit('analytics.insight_created', {
        module: 'reporting',
        insight: `Reporte ${reportId} compartido con ${sharedWith.length} usuarios (acceso ${accessLevel})`,
        priority: 'low'
      });

      // Alert on admin access grants
      if (accessLevel === 'admin' && sharedWith.length > 5) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'reporting',
          insight: `Acceso admin otorgado a ${sharedWith.length} usuarios para reporte ${reportId} - Revisar permisos`,
          priority: 'medium'
        });
      }
    });

    // When report is exported, track usage and distribution
    moduleEventBus.on('reporting.exported', ({ reportId, format, destination, fileSize }) => {
      console.log(`[EventBus] Report exported: ${reportId} as ${format} (${fileSize})`);

      // Generate export analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'reporting',
        analyticsData: {
          reportExported: {
            reportId,
            format,
            destination,
            fileSize,
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });

      // Track export patterns for optimization
      if (format === 'excel' && parseFloat(fileSize) > 10) { // 10MB
        moduleEventBus.emit('analytics.insight_created', {
          module: 'reporting',
          insight: `Export grande de Excel ${reportId} (${fileSize}) - Considerar optimización`,
          priority: 'medium'
        });
      }
    });

    // When template is created, track reusability patterns
    moduleEventBus.on('reporting.template_created', ({ templateId, templateName, baseReportId }) => {
      console.log(`[EventBus] Report template created: ${templateId} from ${baseReportId}`);

      // Generate template analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'reporting',
        analyticsData: {
          templateCreated: {
            templateId,
            templateName,
            baseReportId,
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });

      // Create reusability insight
      moduleEventBus.emit('analytics.insight_created', {
        module: 'reporting',
        insight: `Template ${templateName} creado desde reporte ${baseReportId} - Aumenta reutilización`,
        priority: 'medium'
      });

      // Suggest best practices
      moduleEventBus.emit('analytics.recommendation_created', {
        module: 'reporting',
        recommendation: `Documentar template ${templateName} para maximizar adopción en el equipo`,
        actionable: true
      });
    });

    // When reporting error occurs, coordinate with system monitoring
    moduleEventBus.on('reporting.error', ({ reportId, errorMessage, errorType }) => {
      console.log(`[EventBus] Reporting error: ${reportId}, type: ${errorType}`);

      // Create error alert
      moduleEventBus.emit('analytics.insight_created', {
        module: 'reporting',
        insight: `Error en reporte ${reportId}: ${errorType} - ${errorMessage}`,
        priority: 'high'
      });

      // Generate error analytics for patterns
      moduleEventBus.emit('analytics.generated', {
        module: 'reporting',
        analyticsData: {
          reportError: {
            reportId,
            errorType,
            errorMessage,
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });

      // Create actionable recommendations based on error type
      if (errorType === 'data_source_timeout') {
        moduleEventBus.emit('analytics.recommendation_created', {
          module: 'reporting',
          recommendation: `Optimizar consultas de datos para reporte ${reportId} - timeout detectado`,
          actionable: true
        });
      } else if (errorType === 'memory_limit') {
        moduleEventBus.emit('analytics.recommendation_created', {
          module: 'reporting',
          recommendation: `Reducir alcance o implementar paginación en reporte ${reportId}`,
          actionable: true
        });
      }
    });

    // When performance alert is triggered, coordinate optimization
    moduleEventBus.on('reporting.performance_alert', ({ reportId, metric, value, threshold }) => {
      console.log(`[EventBus] Performance alert: ${reportId}, ${metric} = ${value} (threshold: ${threshold})`);

      // Create performance insight
      moduleEventBus.emit('analytics.insight_created', {
        module: 'reporting',
        insight: `Alerta de performance en reporte ${reportId}: ${metric} = ${value} excede límite ${threshold}`,
        priority: 'high'
      });

      // Generate performance analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'reporting',
        analyticsData: {
          performanceAlert: {
            reportId,
            metric,
            value,
            threshold,
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });

      // Create optimization recommendations
      if (metric === 'generation_time' && value > threshold) {
        moduleEventBus.emit('analytics.recommendation_created', {
          module: 'reporting',
          recommendation: `Optimizar tiempo de generación para reporte ${reportId} - actual: ${value}s, objetivo: ${threshold}s`,
          actionable: true
        });
      } else if (metric === 'memory_usage' && value > threshold) {
        moduleEventBus.emit('analytics.recommendation_created', {
          module: 'reporting',
          recommendation: `Reducir uso de memoria en reporte ${reportId} - implementar streaming o paginación`,
          actionable: true
        });
      }
    });

    // When data source is updated, coordinate with affected modules
    moduleEventBus.on('reporting.data_source_updated', ({ reportId, modulesChanged, dataPointsAdded }) => {
      console.log(`[EventBus] Data source updated: ${reportId}, modules: ${modulesChanged.join(', ')}, +${dataPointsAdded} data points`);

      // Generate data source analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'reporting',
        analyticsData: {
          dataSourceUpdated: {
            reportId,
            modulesChanged,
            dataPointsAdded,
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });

      // Create data expansion insight
      if (dataPointsAdded > 1000) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'reporting',
          insight: `Expansión significativa de datos en reporte ${reportId}: +${dataPointsAdded} puntos desde ${modulesChanged.join(', ')}`,
          priority: 'medium'
        });
      }

      // Suggest regeneration if major changes
      if (modulesChanged.length > 3) {
        moduleEventBus.emit('analytics.recommendation_created', {
          module: 'reporting',
          recommendation: `Regenerar reporte ${reportId} debido a cambios en ${modulesChanged.length} módulos`,
          actionable: true
        });
      }
    });

    // When insight is generated by reporting AI, track quality and adoption
    moduleEventBus.on('reporting.insight_generated', ({ reportId, insightType, confidence, businessValue }) => {
      console.log(`[EventBus] Reporting insight generated: ${reportId}, type: ${insightType}, confidence: ${confidence}%`);

      // Generate insight quality analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'reporting',
        analyticsData: {
          insightGenerated: {
            reportId,
            insightType,
            confidence,
            businessValue,
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });

      // Create quality assessment
      if (confidence > 90 && businessValue > 10000) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'reporting',
          insight: `Insight de alto valor generado en reporte ${reportId}: ${insightType} (${confidence}% confianza, $${businessValue.toLocaleString()} valor)`,
          priority: 'high'
        });
      }

      // Track AI effectiveness
      if (confidence < 70) {
        moduleEventBus.emit('analytics.recommendation_created', {
          module: 'reporting',
          recommendation: `Mejorar calidad de datos para insight ${insightType} en reporte ${reportId} (confianza baja: ${confidence}%)`,
          actionable: true
        });
      }
    });

    // When report is cancelled, track reasons and patterns
    moduleEventBus.on('reporting.cancelled', ({ reportId, reason }) => {
      console.log(`[EventBus] Report cancelled: ${reportId}, reason: ${reason}`);

      // Generate cancellation analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'reporting',
        analyticsData: {
          reportCancelled: {
            reportId,
            reason: reason || 'No reason provided',
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });

      // Create cancellation insight
      moduleEventBus.emit('analytics.insight_created', {
        module: 'reporting',
        insight: `Reporte ${reportId} cancelado${reason ? `: ${reason}` : ''} - Analizar patrones de cancelación`,
        priority: 'medium'
      });

      // If performance-related cancellation, suggest optimization
      if (reason?.includes('slow') || reason?.includes('timeout')) {
        moduleEventBus.emit('analytics.recommendation_created', {
          module: 'reporting',
          recommendation: `Optimizar performance de reporte ${reportId} para prevenir futuras cancelaciones`,
          actionable: true
        });
      }
    });
  }

  /**
   * Executive BI module integrations
   */
  private static setupExecutiveIntegrations() {
    // When NLP query is processed, generate insights
    moduleEventBus.on('executive.nlp_query_processed', ({ query, context, responseType, processingTime, confidence }) => {
      console.log(`[EventBus] NLP Query processed: ${query} in ${processingTime}ms`);

      // Generate query analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'executive-bi',
        analyticsData: {
          nlpQuery: {
            query,
            context,
            responseType,
            processingTime,
            confidence,
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });

      // Create insight based on confidence level
      if (confidence < 0.7) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'executive-bi',
          insight: `Consulta NLP con baja confianza (${Math.round(confidence * 100)}%): "${query}" - Revisar contexto`,
          priority: 'medium'
        });
      }
    });

    // When external data source is added, validate and track
    moduleEventBus.on('executive.external_data_source_added', ({ sourceId, name, type, endpoint }) => {
      console.log(`[EventBus] External data source added: ${name} (${type})`);

      // Generate data source analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'executive-bi',
        analyticsData: {
          dataSourceAdded: {
            sourceId,
            name,
            type,
            endpoint,
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });

      // Create integration insight
      moduleEventBus.emit('analytics.insight_created', {
        module: 'executive-bi',
        insight: `Nueva fuente de datos integrada: ${name} (${type}) - Aumenta capacidades de BI`,
        priority: 'medium'
      });
    });

    // When external data is synced, track performance
    moduleEventBus.on('executive.external_data_synced', ({ sourceId, status, recordsProcessed, timestamp }) => {
      console.log(`[EventBus] External data synced: ${sourceId}, status: ${status}, records: ${recordsProcessed}`);

      // Generate sync analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'executive-bi',
        analyticsData: {
          dataSyncCompleted: {
            sourceId,
            status,
            recordsProcessed,
            timestamp: timestamp.toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });

      // Create alerts for sync failures
      if (status === 'error') {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'executive-bi',
          insight: `Error en sincronización de fuente ${sourceId} - Verificar conectividad`,
          priority: 'high'
        });
      }

      // Create success insight for large syncs
      if (status === 'success' && recordsProcessed > 1000) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'executive-bi',
          insight: `Sincronización masiva exitosa: ${recordsProcessed.toLocaleString()} registros desde ${sourceId}`,
          priority: 'low'
        });
      }
    });

    // When chart is exported, track usage patterns
    moduleEventBus.on('executive.chart_exported', ({ chartId, format, timestamp, fileSize }) => {
      console.log(`[EventBus] Chart exported: ${chartId} as ${format}, size: ${fileSize}KB`);

      // Generate export analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'executive-bi',
        analyticsData: {
          chartExported: {
            chartId,
            format,
            fileSize,
            timestamp: timestamp.toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });

      // Track popular charts
      moduleEventBus.emit('analytics.insight_created', {
        module: 'executive-bi',
        insight: `Gráfico ${chartId} exportado como ${format.toUpperCase()} - Tracking popularidad`,
        priority: 'low'
      });
    });

    // When KPI threshold is breached, create alerts
    moduleEventBus.on('executive.kpi_threshold_breached', ({ kpi, value, threshold, severity }) => {
      console.log(`[EventBus] KPI threshold breached: ${kpi}, value: ${value}, threshold: ${threshold}`);

      // Generate threshold breach analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'executive-bi',
        analyticsData: {
          kpiThresholdBreach: {
            kpi,
            value,
            threshold,
            severity,
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });

      // Create priority alert based on severity
      moduleEventBus.emit('analytics.insight_created', {
        module: 'executive-bi',
        insight: `ALERTA ${severity.toUpperCase()}: KPI ${kpi} = ${value} (umbral: ${threshold})`,
        priority: severity === 'critical' ? 'high' : 'medium'
      });

      // Create actionable recommendation
      moduleEventBus.emit('analytics.recommendation_created', {
        module: 'executive-bi',
        recommendation: `Analizar causas de desviación en ${kpi} y implementar acciones correctivas`,
        actionable: true
      });
    });

    // When forecast is updated, validate accuracy
    moduleEventBus.on('executive.forecast_updated', ({ metric, forecastPeriod, accuracy, lastUpdate }) => {
      console.log(`[EventBus] Forecast updated: ${metric}, accuracy: ${accuracy}%, period: ${forecastPeriod}`);

      // Generate forecast analytics
      moduleEventBus.emit('analytics.generated', {
        module: 'executive-bi',
        analyticsData: {
          forecastUpdated: {
            metric,
            forecastPeriod,
            accuracy,
            lastUpdate: lastUpdate.toISOString()
          }
        },
        timestamp: new Date().toISOString()
      });

      // Alert for low accuracy forecasts
      if (accuracy < 80) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'executive-bi',
          insight: `Pronóstico de ${metric} con baja precisión (${accuracy}%) - Revisar modelo`,
          priority: 'medium'
        });
      }

      // Celebrate high accuracy
      if (accuracy > 95) {
        moduleEventBus.emit('analytics.insight_created', {
          module: 'executive-bi',
          insight: `Excelente precisión en pronóstico de ${metric} (${accuracy}%) - Modelo optimizado`,
          priority: 'low'
        });
      }
    });
  }

  /**
   * Analytics module integrations
   */
  private static setupAnalyticsIntegrations() {
    // When analytics are generated, log for system monitoring
    moduleEventBus.on('analytics.generated', ({ module, analyticsData, timestamp }) => {
      console.log(`[EventBus] Analytics generated for ${module} at ${timestamp}`);

      // Could trigger dashboard updates, cache invalidation, etc.
    });

    // When insights are created, handle based on priority
    moduleEventBus.on('analytics.insight_created', ({ module, insight, priority }) => {
      console.log(`[EventBus] ${priority.toUpperCase()} insight from ${module}: ${insight}`);

      // High priority insights could trigger notifications, emails, etc.
      if (priority === 'high') {
        // This would integrate with notification system
        console.warn(`🚨 HIGH PRIORITY INSIGHT: ${insight}`);
      }
    });

    // When recommendations are created, log for follow-up
    moduleEventBus.on('analytics.recommendation_created', ({ module, recommendation, actionable }) => {
      console.log(`[EventBus] Recommendation from ${module}: ${recommendation} (actionable: ${actionable})`);

      if (actionable) {
        // Could trigger workflow automation, task creation, etc.
      }
    });
  }

  /**
   * System-level integrations
   */
  private static setupSystemIntegrations() {
    // Monitor module loading
    moduleEventBus.on('system.module_loaded', ({ moduleName, timestamp }) => {
      console.log(`[EventBus] Module loaded: ${moduleName} at ${timestamp}`);
    });

    // Handle module errors
    moduleEventBus.on('system.module_error', ({ moduleName, error, timestamp }) => {
      console.error(`[EventBus] Module error in ${moduleName} at ${timestamp}: ${error}`);

      // Could trigger error recovery, logging, monitoring alerts
    });

    // Handle performance alerts
    moduleEventBus.on('system.performance_alert', ({ module, metric, value, threshold }) => {
      console.warn(`[EventBus] Performance alert in ${module}: ${metric} = ${value} (threshold: ${threshold})`);

      // Could trigger optimization routines, scaling, alerts
    });
  }
}

/**
 * Module Event Bus utilities for easy integration
 */
export const ModuleEventUtils = {
  /**
   * Emit customer events with validation
   */
  customer: {
    created: (customerId: string, customerData: any) => {
      moduleEventBus.emit('customer.created', { customerId, customerData });
    },
    updated: (customerId: string, customerData: any) => {
      moduleEventBus.emit('customer.updated', { customerId, customerData });
    },
    deleted: (customerId: string) => {
      moduleEventBus.emit('customer.deleted', { customerId });
    },
    rfmUpdated: (customerId: string, segment: string, scores: { r: number; f: number; m: number }) => {
      moduleEventBus.emit('customer.rfm_updated', { customerId, segment, scores });
    }
  },

  /**
   * Emit material/inventory events
   */
  materials: {
    created: (materialId: string, materialData: any) => {
      moduleEventBus.emit('material.created', { materialId, materialData });
    },
    stockLow: (materialId: string, currentStock: number, minStock: number) => {
      moduleEventBus.emit('material.stock_low', { materialId, currentStock, minStock });
    },
    stockCritical: (materialId: string, currentStock: number, minStock: number) => {
      moduleEventBus.emit('material.stock_critical', { materialId, currentStock, minStock });
    },
    stockAdjusted: (materialId: string, adjustment: number, reason?: string) => {
      moduleEventBus.emit('material.stock_adjusted', { materialId, adjustment, reason });
    }
  },

  /**
   * Emit sales events
   */
  sales: {
    completed: (saleId: string, total: number, customerId?: string, items: any[] = []) => {
      moduleEventBus.emit('sale.completed', { saleId, total, customerId, items });
    },
    paymentProcessed: (saleId: string, paymentMethod: string, amount: number) => {
      moduleEventBus.emit('sale.payment_processed', { saleId, paymentMethod, amount });
    }
  },

  /**
   * Emit analytics events
   */
  analytics: {
    generated: (module: string, analyticsData: any) => {
      moduleEventBus.emit('analytics.generated', {
        module,
        analyticsData,
        timestamp: new Date().toISOString()
      });
    },
    insightCreated: (module: string, insight: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
      moduleEventBus.emit('analytics.insight_created', { module, insight, priority });
    },
    recommendationCreated: (module: string, recommendation: string, actionable: boolean = true) => {
      moduleEventBus.emit('analytics.recommendation_created', { module, recommendation, actionable });
    }
  },

  /**
   * Emit staff events
   */
  staff: {
    created: (staffId: string, staffData: any) => {
      moduleEventBus.emit('staff.created', { staffId, staffData });
    },
    updated: (staffId: string, staffData: any) => {
      moduleEventBus.emit('staff.updated', { staffId, staffData });
    },
    scheduleChanged: (staffId: string, scheduleData: any) => {
      moduleEventBus.emit('staff.schedule_changed', { staffId, scheduleData });
    },
    performanceUpdated: (staffId: string, metrics: any) => {
      moduleEventBus.emit('staff.performance_updated', { staffId, metrics });
    }
  },

  /**
   * Emit schedule events
   */
  schedule: {
    created: (scheduleId: string, staffId: string, scheduleData: any) => {
      moduleEventBus.emit('schedule.created', { scheduleId, staffId, scheduleData });
    },
    updated: (scheduleId: string, scheduleData: any) => {
      moduleEventBus.emit('schedule.updated', { scheduleId, scheduleData });
    },
    conflictDetected: (staffId: string, conflictingSchedules: any[]) => {
      moduleEventBus.emit('schedule.conflict_detected', { staffId, conflictingSchedules });
    }
  },

  /**
   * Emit fiscal events
   */
  fiscal: {
    created: (invoiceId: string, invoiceData: any) => {
      moduleEventBus.emit('fiscal.invoice_created', { invoiceId, invoiceData });
    },
    updated: (invoiceId: string, invoiceData: any) => {
      moduleEventBus.emit('fiscal.invoice_updated', { invoiceId, invoiceData });
    },
    cancelled: (invoiceId: string, reason?: string) => {
      moduleEventBus.emit('fiscal.invoice_cancelled', { invoiceId, reason });
    },
    taxCalculated: (invoiceId: string, taxBreakdown: any, totalTax: number) => {
      moduleEventBus.emit('fiscal.tax_calculated', { invoiceId, taxBreakdown, totalTax });
    },
    afipSubmitted: (invoiceId: string, cae: string | undefined, status: string) => {
      moduleEventBus.emit('fiscal.afip_submitted', { invoiceId, cae, status });
    },
    paymentReceived: (invoiceId: string, amount: number, paymentMethod: string) => {
      moduleEventBus.emit('fiscal.payment_received', { invoiceId, amount, paymentMethod });
    }
  },

  /**
   * Emit billing events
   */
  billing: {
    subscriptionCreated: (subscriptionId: string, subscriptionData: any, customerId?: string) => {
      moduleEventBus.emit('billing.subscription_created', { subscriptionId, subscriptionData, customerId });
    },
    subscriptionUpdated: (subscriptionId: string, subscriptionData: any) => {
      moduleEventBus.emit('billing.subscription_updated', { subscriptionId, subscriptionData });
    },
    subscriptionCancelled: (subscriptionId: string, reason?: string, customerId?: string) => {
      moduleEventBus.emit('billing.subscription_cancelled', { subscriptionId, reason, customerId });
    },
    subscriptionSuspended: (subscriptionId: string, reason?: string, customerId?: string) => {
      moduleEventBus.emit('billing.subscription_suspended', { subscriptionId, reason, customerId });
    },
    subscriptionReactivated: (subscriptionId: string, customerId?: string) => {
      moduleEventBus.emit('billing.subscription_reactivated', { subscriptionId, customerId });
    },
    invoiceGenerated: (subscriptionId: string, invoiceId: string, amount: number, dueDate: string) => {
      moduleEventBus.emit('billing.invoice_generated', { subscriptionId, invoiceId, amount, dueDate });
    },
    paymentSucceeded: (subscriptionId: string, invoiceId: string, amount: number, customerId?: string) => {
      moduleEventBus.emit('billing.payment_succeeded', { subscriptionId, invoiceId, amount, customerId });
    },
    paymentFailed: (subscriptionId: string, invoiceId: string, attempt: number, reason?: string) => {
      moduleEventBus.emit('billing.payment_failed', { subscriptionId, invoiceId, attempt, reason });
    },
    retryScheduled: (subscriptionId: string, invoiceId: string, retryDate: string, attempt: number) => {
      moduleEventBus.emit('billing.retry_scheduled', { subscriptionId, invoiceId, retryDate, attempt });
    },
    dunningTriggered: (subscriptionId: string, customerId: string, overdueDays: number) => {
      moduleEventBus.emit('billing.dunning_triggered', { subscriptionId, customerId, overdueDays });
    },
    churnRiskDetected: (customerId: string, subscriptionId: string, riskLevel: 'low' | 'medium' | 'high') => {
      moduleEventBus.emit('billing.churn_risk_detected', { customerId, subscriptionId, riskLevel });
    },
    mrrUpdated: (previousMrr: number, currentMrr: number, change: number) => {
      moduleEventBus.emit('billing.mrr_updated', {
        previousMrr,
        currentMrr,
        change,
        timestamp: new Date().toISOString()
      });
    }
  },

  /**
   * Emit membership events
   */
  membership: {
    created: (membershipId: string, membershipData: any, customerId?: string) => {
      moduleEventBus.emit('membership.created', { membershipId, membershipData, customerId });
    },
    updated: (membershipId: string, membershipData: any) => {
      moduleEventBus.emit('membership.updated', { membershipId, membershipData });
    },
    renewed: (membershipId: string, customerId: string, renewalData: any) => {
      moduleEventBus.emit('membership.renewed', { membershipId, customerId, renewalData });
    },
    cancelled: (membershipId: string, customerId: string, reason?: string) => {
      moduleEventBus.emit('membership.cancelled', { membershipId, customerId, reason });
    },
    suspended: (membershipId: string, customerId: string, reason?: string) => {
      moduleEventBus.emit('membership.suspended', { membershipId, customerId, reason });
    },
    expired: (membershipId: string, customerId: string, expiredDate: string) => {
      moduleEventBus.emit('membership.expired', { membershipId, customerId, expiredDate });
    },
    visitLogged: (membershipId: string, customerId: string, facility: string, duration?: number) => {
      moduleEventBus.emit('membership.visit_logged', { membershipId, customerId, facility, duration });
    },
    churnRiskDetected: (membershipId: string, customerId: string, riskLevel: 'low' | 'medium' | 'high', inactivityDays: number) => {
      moduleEventBus.emit('membership.churn_risk_detected', { membershipId, customerId, riskLevel, inactivityDays });
    },
    benefitUsed: (membershipId: string, customerId: string, benefit: string, usage: any) => {
      moduleEventBus.emit('membership.benefit_used', { membershipId, customerId, benefit, usage });
    },
    engagementScoreUpdated: (membershipId: string, customerId: string, score: number, previousScore: number) => {
      moduleEventBus.emit('membership.engagement_score_updated', { membershipId, customerId, score, previousScore });
    },
    upgradeRequested: (membershipId: string, customerId: string, fromType: string, toType: string) => {
      moduleEventBus.emit('membership.upgrade_requested', { membershipId, customerId, fromType, toType });
    },
    paymentOverdue: (membershipId: string, customerId: string, overdueDays: number, amount: number) => {
      moduleEventBus.emit('membership.payment_overdue', { membershipId, customerId, overdueDays, amount });
    }
  },

  /**
   * Emit rental events
   */
  rental: {
    created: (rentalId: string, rentalData: any, customerId: string | undefined, assetId: string) => {
      moduleEventBus.emit('rental.created', { rentalId, rentalData, customerId, assetId });
    },
    updated: (rentalId: string, rentalData: any) => {
      moduleEventBus.emit('rental.updated', { rentalId, rentalData });
    },
    started: (rentalId: string, customerId: string, assetId: string, startTime: string) => {
      moduleEventBus.emit('rental.started', { rentalId, customerId, assetId, startTime });
    },
    completed: (rentalId: string, customerId: string, assetId: string, endTime: string, finalCost: number) => {
      moduleEventBus.emit('rental.completed', { rentalId, customerId, assetId, endTime, finalCost });
    },
    cancelled: (rentalId: string, customerId: string | undefined, assetId: string, reason?: string, cancellationFee?: number) => {
      moduleEventBus.emit('rental.cancelled', { rentalId, customerId, assetId, reason, cancellationFee });
    },
    extended: (rentalId: string, originalEndTime: string, newEndTime: string, additionalCost: number) => {
      moduleEventBus.emit('rental.extended', { rentalId, originalEndTime, newEndTime, additionalCost });
    },
    paymentProcessed: (rentalId: string, amount: number, paymentMethod: string, customerId?: string) => {
      moduleEventBus.emit('rental.payment_processed', { rentalId, amount, paymentMethod, customerId });
    },
    paymentFailed: (rentalId: string, amount: number, reason?: string, customerId?: string) => {
      moduleEventBus.emit('rental.payment_failed', { rentalId, amount, reason, customerId });
    },
    assetDamaged: (rentalId: string, assetId: string, customerId: string, damageDescription: string, repairCost?: number) => {
      moduleEventBus.emit('rental.asset_damaged', { rentalId, assetId, customerId, damageDescription, repairCost });
    },
    assetReturned: (rentalId: string, assetId: string, condition: 'good' | 'fair' | 'poor' | 'damaged', notes?: string) => {
      moduleEventBus.emit('rental.asset_returned', { rentalId, assetId, condition, notes });
    },
    overdue: (rentalId: string, customerId: string, assetId: string, overdueDays: number, lateFees: number) => {
      moduleEventBus.emit('rental.overdue', { rentalId, customerId, assetId, overdueDays, lateFees });
    },
    utilizationUpdated: (assetId: string, utilizationRate: number, revenue: number, period: string) => {
      moduleEventBus.emit('rental.utilization_updated', { assetId, utilizationRate, revenue, period });
    }
  },

  /**
   * Emit reporting events
   */
  reporting: {
    created: (reportId: string, reportName: string, type: string, modules: string[], dataPoints: number) => {
      moduleEventBus.emit('reporting.created', { reportId, reportName, type, modules, dataPoints });
    },
    updated: (reportId: string, reportName: string, changesMade: string[]) => {
      moduleEventBus.emit('reporting.updated', { reportId, reportName, changesMade });
    },
    generated: (reportId: string, status: 'success' | 'failed', generationTime: string, size: string) => {
      moduleEventBus.emit('reporting.generated', { reportId, status, generationTime, size });
    },
    scheduled: (reportId: string, frequency: string, nextRun: string, recipients: string[]) => {
      moduleEventBus.emit('reporting.scheduled', { reportId, frequency, nextRun, recipients });
    },
    cancelled: (reportId: string, reason?: string) => {
      moduleEventBus.emit('reporting.cancelled', { reportId, reason });
    },
    shared: (reportId: string, sharedWith: string[], accessLevel: 'view' | 'edit' | 'admin') => {
      moduleEventBus.emit('reporting.shared', { reportId, sharedWith, accessLevel });
    },
    exported: (reportId: string, format: string, destination: string, fileSize: string) => {
      moduleEventBus.emit('reporting.exported', { reportId, format, destination, fileSize });
    },
    templateCreated: (templateId: string, templateName: string, baseReportId: string) => {
      moduleEventBus.emit('reporting.template_created', { templateId, templateName, baseReportId });
    },
    error: (reportId: string, errorMessage: string, errorType: string) => {
      moduleEventBus.emit('reporting.error', { reportId, errorMessage, errorType });
    },
    performanceAlert: (reportId: string, metric: string, value: number, threshold: number) => {
      moduleEventBus.emit('reporting.performance_alert', { reportId, metric, value, threshold });
    },
    dataSourceUpdated: (reportId: string, modulesChanged: string[], dataPointsAdded: number) => {
      moduleEventBus.emit('reporting.data_source_updated', { reportId, modulesChanged, dataPointsAdded });
    },
    insightGenerated: (reportId: string, insightType: string, confidence: number, businessValue: number) => {
      moduleEventBus.emit('reporting.insight_generated', { reportId, insightType, confidence, businessValue });
    }
  },

  /**
   * Emit asset events
   */
  asset: {
    created: (assetId: string, assetData: any, category: string) => {
      moduleEventBus.emit('asset.created', { assetId, assetData, category });
    },
    updated: (assetId: string, assetData: any) => {
      moduleEventBus.emit('asset.updated', { assetId, assetData });
    },
    conditionChanged: (assetId: string, previousCondition: string, newCondition: string, reason?: string) => {
      moduleEventBus.emit('asset.condition_changed', { assetId, previousCondition, newCondition, reason });
    },
    maintenanceScheduled: (assetId: string, maintenanceDate: string, maintenanceType: string, cost?: number) => {
      moduleEventBus.emit('asset.maintenance_scheduled', { assetId, maintenanceDate, maintenanceType, cost });
    },
    maintenanceCompleted: (assetId: string, completionDate: string, cost: number, notes?: string) => {
      moduleEventBus.emit('asset.maintenance_completed', { assetId, completionDate, cost, notes });
    },
    maintenanceOverdue: (assetId: string, scheduledDate: string, overdueDays: number) => {
      moduleEventBus.emit('asset.maintenance_overdue', { assetId, scheduledDate, overdueDays });
    },
    locationChanged: (assetId: string, previousLocation: string, newLocation: string, reason?: string) => {
      moduleEventBus.emit('asset.location_changed', { assetId, previousLocation, newLocation, reason });
    },
    utilizationUpdated: (assetId: string, utilizationRate: number, revenue: number, period: string) => {
      moduleEventBus.emit('asset.utilization_updated', { assetId, utilizationRate, revenue, period });
    },
    depreciationCalculated: (assetId: string, currentValue: number, depreciationAmount: number, period: string) => {
      moduleEventBus.emit('asset.depreciation_calculated', { assetId, currentValue, depreciationAmount, period });
    },
    retired: (assetId: string, retirementDate: string, reason: string, salvageValue?: number) => {
      moduleEventBus.emit('asset.retired', { assetId, retirementDate, reason, salvageValue });
    },
    damageReported: (assetId: string, damageDescription: string, severity: 'minor' | 'major' | 'critical', repairCost?: number) => {
      moduleEventBus.emit('asset.damage_reported', { assetId, damageDescription, severity, repairCost });
    },
    warrantyExpiring: (assetId: string, expirationDate: string, daysRemaining: number) => {
      moduleEventBus.emit('asset.warranty_expiring', { assetId, expirationDate, daysRemaining });
    }
  },

  /**
   * Emit executive BI events
   */
  executive: {
    nlpQueryProcessed: (data: { query: string; context: string; responseType: string; processingTime: number; confidence: number }) => {
      moduleEventBus.emit('executive.nlp_query_processed', data);
    },
    externalDataSourceAdded: (data: { sourceId: string; name: string; type: string; endpoint: string }) => {
      moduleEventBus.emit('executive.external_data_source_added', data);
    },
    externalDataSynced: (data: { sourceId: string; status: 'success' | 'error'; recordsProcessed: number; timestamp: Date }) => {
      moduleEventBus.emit('executive.external_data_synced', data);
    },
    chartExported: (data: { chartId: string; format: string; timestamp: Date; fileSize: number }) => {
      moduleEventBus.emit('executive.chart_exported', data);
    },
    dashboardViewed: (dashboardType: string, userId?: string) => {
      moduleEventBus.emit('executive.dashboard_viewed', {
        dashboardType,
        userId,
        timestamp: new Date()
      });
    },
    insightGenerated: (category: string, insight: string, confidence: number, actionable: boolean = true) => {
      moduleEventBus.emit('executive.insight_generated', {
        category,
        insight,
        confidence,
        actionable
      });
    },
    kpiThresholdBreached: (kpi: string, value: number, threshold: number, severity: 'warning' | 'critical') => {
      moduleEventBus.emit('executive.kpi_threshold_breached', {
        kpi,
        value,
        threshold,
        severity
      });
    },
    forecastUpdated: (metric: string, forecastPeriod: string, accuracy: number) => {
      moduleEventBus.emit('executive.forecast_updated', {
        metric,
        forecastPeriod,
        accuracy,
        lastUpdate: new Date()
      });
    }
  },

  /**
   * Emit system events
   */
  system: {
    moduleLoaded: (moduleName: string) => {
      moduleEventBus.emit('system.module_loaded', {
        moduleName,
        timestamp: new Date().toISOString()
      });
    },
    moduleError: (moduleName: string, error: string) => {
      moduleEventBus.emit('system.module_error', {
        moduleName,
        error,
        timestamp: new Date().toISOString()
      });
    }
  }
};

// Initialize integrations when module is imported
ModuleIntegrations.initialize();

export default moduleEventBus;