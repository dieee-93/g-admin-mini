// ConflictResolution.ts - Advanced Conflict Resolution for G-Admin Mini
// Handles complex data conflicts with intelligent resolution strategies

import { EventBus } from '@/lib/events';
import { EventBus } from '@/lib/events';
import localStorage from './LocalStorage';

// Conflict types and resolution strategies
interface DataConflict {
  id: string;
  type: ConflictType;
  entity: string;
  field: string;
  localValue: any;
  remoteValue: any;
  baseValue?: any; // Original value for 3-way merge
  timestamp: number;
  severity: ConflictSeverity;
  autoResolvable: boolean;
  metadata: ConflictMetadata;
}

interface ConflictMetadata {
  localTimestamp: number;
  remoteTimestamp: number;
  localVersion: number;
  remoteVersion: number;
  localUser: string;
  remoteUser: string;
  operationType: 'CREATE' | 'UPDATE' | 'DELETE';
  fieldType: FieldType;
  businessContext: BusinessContext;
}

interface BusinessContext {
  module: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  businessRules: string[];
  dependencies: string[];
  permissions: string[];
}

interface ResolutionStrategy {
  name: string;
  priority: number;
  condition: (conflict: DataConflict) => boolean;
  resolve: (conflict: DataConflict) => ResolutionResult;
  description: string;
}

interface ResolutionResult {
  success: boolean;
  resolvedValue: any;
  strategy: string;
  confidence: number; // 0-100
  explanation: string;
  requiresUserConfirmation?: boolean;
  sideEffects?: SideEffect[];
}

interface SideEffect {
  type: 'update' | 'notify' | 'log' | 'cascade';
  target: string;
  action: string;
  data: any;
}

enum ConflictType {
  VALUE_CONFLICT = 'value_conflict',
  VERSION_CONFLICT = 'version_conflict',
  DELETE_CONFLICT = 'delete_conflict',
  DEPENDENCY_CONFLICT = 'dependency_conflict',
  PERMISSION_CONFLICT = 'permission_conflict',
  BUSINESS_RULE_CONFLICT = 'business_rule_conflict'
}

enum ConflictSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

enum FieldType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  ARRAY = 'array',
  OBJECT = 'object',
  MONETARY = 'monetary',
  QUANTITY = 'quantity',
  STATUS = 'status',
  REFERENCE = 'reference'
}

class ConflictResolutionEngine {
  private strategies: ResolutionStrategy[] = [];
  private activeConflicts: Map<string, DataConflict> = new Map();
  private resolutionHistory: Map<string, ResolutionResult> = new Map();
  private userPreferences: Map<string, any> = new Map();
  
  constructor() {
    this.initializeStrategies();
    this.loadUserPreferences();
  }

  // Initialize resolution strategies in priority order
  private initializeStrategies(): void {
    this.strategies = [
      // 1. Business Rule Strategy (Highest Priority)
      {
        name: 'business_rule',
        priority: 100,
        condition: (conflict) => this.hasBusinessRuleViolation(conflict),
        resolve: (conflict) => this.resolveByBusinessRules(conflict),
        description: 'Resolves based on business logic and constraints'
      },
      
      // 2. Monetary Precision Strategy
      {
        name: 'monetary_precision',
        priority: 90,
        condition: (conflict) => conflict.metadata.fieldType === FieldType.MONETARY,
        resolve: (conflict) => this.resolveMonetaryConflict(conflict),
        description: 'Handles monetary values with precision and audit trail'
      },
      
      // 3. Timestamp-based Strategy
      {
        name: 'last_writer_wins',
        priority: 80,
        condition: (conflict) => this.canResolveByTimestamp(conflict),
        resolve: (conflict) => this.resolveByTimestamp(conflict),
        description: 'Uses most recent timestamp to determine winner'
      },
      
      // 4. User Authority Strategy
      {
        name: 'user_authority',
        priority: 70,
        condition: (conflict) => this.hasUserAuthorityDifference(conflict),
        resolve: (conflict) => this.resolveByUserAuthority(conflict),
        description: 'Prioritizes changes by users with higher authority'
      },
      
      // 5. Quantity Accumulation Strategy
      {
        name: 'quantity_accumulation',
        priority: 60,
        condition: (conflict) => this.isAccumulativeField(conflict),
        resolve: (conflict) => this.resolveByAccumulation(conflict),
        description: 'Accumulates quantities and counts'
      },
      
      // 6. Status Precedence Strategy
      {
        name: 'status_precedence',
        priority: 50,
        condition: (conflict) => conflict.metadata.fieldType === FieldType.STATUS,
        resolve: (conflict) => this.resolveStatusConflict(conflict),
        description: 'Resolves status conflicts based on state machine rules'
      },
      
      // 7. Three-way Merge Strategy
      {
        name: 'three_way_merge',
        priority: 40,
        condition: (conflict) => conflict.baseValue !== undefined,
        resolve: (conflict) => this.resolveByThreeWayMerge(conflict),
        description: 'Merges changes from both sides when base value is available'
      },
      
      // 8. Array Merge Strategy
      {
        name: 'array_merge',
        priority: 30,
        condition: (conflict) => conflict.metadata.fieldType === FieldType.ARRAY,
        resolve: (conflict) => this.resolveArrayConflict(conflict),
        description: 'Intelligently merges array changes'
      },
      
      // 9. User Preference Strategy
      {
        name: 'user_preference',
        priority: 20,
        condition: (conflict) => this.hasUserPreference(conflict),
        resolve: (conflict) => this.resolveByUserPreference(conflict),
        description: 'Uses stored user preferences for resolution'
      },
      
      // 10. Default Strategy (Fallback)
      {
        name: 'manual_resolution',
        priority: 10,
        condition: () => true,
        resolve: (conflict) => this.requireManualResolution(conflict),
        description: 'Requires manual user intervention'
      }
    ];
    
    // Sort strategies by priority (highest first)
    this.strategies.sort((a, b) => b.priority - a.priority);
  }

  // Main conflict resolution method
  public async resolveConflict(conflict: DataConflict): Promise<ResolutionResult> {
    console.log(`[ConflictResolution] Resolving conflict: ${conflict.id} (${conflict.type})`);
    
    // Store conflict for tracking
    this.activeConflicts.set(conflict.id, conflict);
    
    try {
      // Find and apply the best strategy
      for (const strategy of this.strategies) {
        if (strategy.condition(conflict)) {
          console.log(`[ConflictResolution] Applying strategy: ${strategy.name}`);
          
          const result = strategy.resolve(conflict);
          
          if (result.success) {
            // Store resolution in history
            this.resolutionHistory.set(conflict.id, result);
            
            // Apply side effects if any
            if (result.sideEffects) {
              await this.applySideEffects(result.sideEffects);
            }
            
            // Emit resolution event
            await EventBus.emit('system.data_synced', {
              type: 'conflict_resolved',
              conflictId: conflict.id,
              strategy: result.strategy,
              confidence: result.confidence,
              requiresUserConfirmation: result.requiresUserConfirmation
            }, 'ConflictResolution');
            
            // Remove from active conflicts if fully resolved
            if (!result.requiresUserConfirmation) {
              this.activeConflicts.delete(conflict.id);
            }
            
            return result;
          }
        }
      }
      
      // If no strategy worked, fall back to manual resolution
      return this.requireManualResolution(conflict);
      
    } catch (error) {
      console.error(`[ConflictResolution] Error resolving conflict ${conflict.id}:`, error);
      return {
        success: false,
        resolvedValue: conflict.localValue,
        strategy: 'error_fallback',
        confidence: 0,
        explanation: `Resolution failed: ${error.message}`,
        requiresUserConfirmation: true
      };
    }
  }

  // Business rule resolution
  private resolveByBusinessRules(conflict: DataConflict): ResolutionResult {
    const rules = conflict.metadata.businessContext.businessRules;
    
    // Apply specific business rules based on entity and field
    if (conflict.entity === 'orders' && conflict.field === 'status') {
      return this.resolveOrderStatusByRules(conflict);
    } else if (conflict.entity === 'inventory' && conflict.field === 'quantity') {
      return this.resolveInventoryQuantityByRules(conflict);
    } else if (conflict.entity === 'staff' && conflict.field === 'clockIn') {
      return this.resolveStaffClockByRules(conflict);
    }
    
    return {
      success: false,
      resolvedValue: conflict.localValue,
      strategy: 'business_rule',
      confidence: 0,
      explanation: 'No applicable business rule found'
    };
  }

  // Order status resolution by business rules
  private resolveOrderStatusByRules(conflict: DataConflict): ResolutionResult {
    const localStatus = conflict.localValue;
    const remoteStatus = conflict.remoteValue;
    
    // Define status precedence (later statuses take precedence)
    const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'completed', 'cancelled'];
    
    const localIndex = statusOrder.indexOf(localStatus);
    const remoteIndex = statusOrder.indexOf(remoteStatus);
    
    // Special rule: cancelled can only be set by authorized users
    if (remoteStatus === 'cancelled' && !this.isAuthorizedForCancellation(conflict.metadata.remoteUser)) {
      return {
        success: true,
        resolvedValue: localStatus,
        strategy: 'business_rule',
        confidence: 95,
        explanation: 'Remote user not authorized to cancel orders',
        sideEffects: [{
          type: 'notify',
          target: 'admin',
          action: 'unauthorized_cancellation_attempt',
          data: { user: conflict.metadata.remoteUser, orderId: conflict.entity }
        }]
      };
    }
    
    // Use higher precedence status
    const resolvedValue = localIndex > remoteIndex ? localStatus : remoteStatus;
    
    return {
      success: true,
      resolvedValue,
      strategy: 'business_rule',
      confidence: 90,
      explanation: `Order status resolved to "${resolvedValue}" based on status precedence rules`
    };
  }

  // Inventory quantity resolution by business rules
  private resolveInventoryQuantityByRules(conflict: DataConflict): ResolutionResult {
    const localQty = parseFloat(conflict.localValue) || 0;
    const remoteQty = parseFloat(conflict.remoteValue) || 0;
    
    // Rule: Never allow negative inventory
    if (localQty < 0 && remoteQty >= 0) {
      return {
        success: true,
        resolvedValue: remoteQty,
        strategy: 'business_rule',
        confidence: 95,
        explanation: 'Prevented negative inventory quantity',
        sideEffects: [{
          type: 'log',
          target: 'audit',
          action: 'negative_inventory_prevented',
          data: { localValue: localQty, resolvedValue: remoteQty }
        }]
      };
    }
    
    // Rule: Large discrepancies require manual review
    const discrepancy = Math.abs(localQty - remoteQty);
    const threshold = Math.max(localQty, remoteQty) * 0.1; // 10% threshold
    
    if (discrepancy > threshold && discrepancy > 10) {
      return {
        success: true,
        resolvedValue: Math.max(localQty, remoteQty), // Conservative approach
        strategy: 'business_rule',
        confidence: 60,
        explanation: `Large quantity discrepancy detected (${discrepancy} units)`,
        requiresUserConfirmation: true,
        sideEffects: [{
          type: 'notify',
          target: 'inventory_manager',
          action: 'quantity_discrepancy_detected',
          data: { localValue: localQty, remoteValue: remoteQty, discrepancy }
        }]
      };
    }
    
    // Default to most recent
    return this.resolveByTimestamp(conflict);
  }

  // Staff clock-in resolution by business rules
  private resolveStaffClockByRules(conflict: DataConflict): ResolutionResult {
    const localTime = new Date(conflict.localValue).getTime();
    const remoteTime = new Date(conflict.remoteValue).getTime();
    
    // Rule: Use earliest clock-in time (employee benefit)
    const resolvedValue = localTime < remoteTime ? conflict.localValue : conflict.remoteValue;
    
    return {
      success: true,
      resolvedValue,
      strategy: 'business_rule',
      confidence: 85,
      explanation: 'Clock-in time resolved to earliest time (employee benefit rule)',
      sideEffects: [{
        type: 'log',
        target: 'hr',
        action: 'clock_time_conflict_resolved',
        data: { localTime: conflict.localValue, remoteTime: conflict.remoteValue, resolved: resolvedValue }
      }]
    };
  }

  // Monetary value resolution with precision handling
  private resolveMonetaryConflict(conflict: DataConflict): ResolutionResult {
    const localAmount = parseFloat(conflict.localValue) || 0;
    const remoteAmount = parseFloat(conflict.remoteValue) || 0;
    
    // Check if values are equivalent when rounded to 2 decimal places
    const localRounded = Math.round(localAmount * 100) / 100;
    const remoteRounded = Math.round(remoteAmount * 100) / 100;
    
    if (localRounded === remoteRounded) {
      return {
        success: true,
        resolvedValue: localRounded,
        strategy: 'monetary_precision',
        confidence: 100,
        explanation: 'Monetary values are equivalent when rounded to 2 decimal places'
      };
    }
    
    // For significant differences, use more recent timestamp with audit
    const result = this.resolveByTimestamp(conflict);
    result.strategy = 'monetary_precision';
    result.sideEffects = [{
      type: 'log',
      target: 'financial_audit',
      action: 'monetary_conflict_resolved',
      data: {
        field: conflict.field,
        entity: conflict.entity,
        localAmount,
        remoteAmount,
        resolvedAmount: result.resolvedValue,
        difference: Math.abs(localAmount - remoteAmount)
      }
    }];
    
    return result;
  }

  // Timestamp-based resolution (Last Writer Wins)
  private resolveByTimestamp(conflict: DataConflict): ResolutionResult {
    const useRemote = conflict.metadata.remoteTimestamp > conflict.metadata.localTimestamp;
    
    return {
      success: true,
      resolvedValue: useRemote ? conflict.remoteValue : conflict.localValue,
      strategy: 'last_writer_wins',
      confidence: 80,
      explanation: `Using ${useRemote ? 'remote' : 'local'} value based on timestamp (${useRemote ? 'newer' : 'older'})`
    };
  }

  // User authority-based resolution
  private resolveByUserAuthority(conflict: DataConflict): ResolutionResult {
    const localAuthority = this.getUserAuthority(conflict.metadata.localUser);
    const remoteAuthority = this.getUserAuthority(conflict.metadata.remoteUser);
    
    const useRemote = remoteAuthority > localAuthority;
    
    return {
      success: true,
      resolvedValue: useRemote ? conflict.remoteValue : conflict.localValue,
      strategy: 'user_authority',
      confidence: 85,
      explanation: `Using ${useRemote ? 'remote' : 'local'} value based on user authority level`
    };
  }

  // Quantity accumulation resolution
  private resolveByAccumulation(conflict: DataConflict): ResolutionResult {
    if (conflict.metadata.fieldType === FieldType.QUANTITY || conflict.metadata.fieldType === FieldType.NUMBER) {
      const localValue = parseFloat(conflict.localValue) || 0;
      const remoteValue = parseFloat(conflict.remoteValue) || 0;
      const baseValue = parseFloat(conflict.baseValue) || 0;
      
      // Calculate delta changes
      const localDelta = localValue - baseValue;
      const remoteDelta = remoteValue - baseValue;
      
      // Apply both deltas
      const resolvedValue = baseValue + localDelta + remoteDelta;
      
      return {
        success: true,
        resolvedValue,
        strategy: 'quantity_accumulation',
        confidence: 75,
        explanation: `Accumulated both changes: base(${baseValue}) + local_delta(${localDelta}) + remote_delta(${remoteDelta}) = ${resolvedValue}`
      };
    }
    
    return {
      success: false,
      resolvedValue: conflict.localValue,
      strategy: 'quantity_accumulation',
      confidence: 0,
      explanation: 'Field is not suitable for accumulation'
    };
  }

  // Status conflict resolution with state machine
  private resolveStatusConflict(conflict: DataConflict): ResolutionResult {
    // This would implement a state machine for different entity types
    if (conflict.entity === 'orders') {
      return this.resolveOrderStatusByRules(conflict);
    }
    
    // Default to timestamp for other status fields
    return this.resolveByTimestamp(conflict);
  }

  // Three-way merge resolution
  private resolveByThreeWayMerge(conflict: DataConflict): ResolutionResult {
    const { localValue, remoteValue, baseValue } = conflict;
    
    // If one side didn't change, use the other
    if (localValue === baseValue) {
      return {
        success: true,
        resolvedValue: remoteValue,
        strategy: 'three_way_merge',
        confidence: 90,
        explanation: 'Local value unchanged, using remote changes'
      };
    }
    
    if (remoteValue === baseValue) {
      return {
        success: true,
        resolvedValue: localValue,
        strategy: 'three_way_merge',
        confidence: 90,
        explanation: 'Remote value unchanged, using local changes'
      };
    }
    
    // Both sides changed, need more sophisticated merge
    if (conflict.metadata.fieldType === FieldType.OBJECT) {
      return this.mergeObjects(localValue, remoteValue, baseValue);
    }
    
    // Fall back to timestamp-based resolution
    return this.resolveByTimestamp(conflict);
  }

  // Array merge resolution
  private resolveArrayConflict(conflict: DataConflict): ResolutionResult {
    const localArray = Array.isArray(conflict.localValue) ? conflict.localValue : [];
    const remoteArray = Array.isArray(conflict.remoteValue) ? conflict.remoteValue : [];
    
    // Merge arrays, removing duplicates
    const mergedSet = new Set([...localArray, ...remoteArray]);
    const resolvedValue = Array.from(mergedSet);
    
    return {
      success: true,
      resolvedValue,
      strategy: 'array_merge',
      confidence: 75,
      explanation: `Merged arrays: local(${localArray.length}) + remote(${remoteArray.length}) = merged(${resolvedValue.length})`
    };
  }

  // Object merge helper
  private mergeObjects(localObj: any, remoteObj: any, baseObj: any): ResolutionResult {
    const merged = { ...baseObj };
    
    // Apply changes from both sides
    for (const key in localObj) {
      if (localObj[key] !== baseObj[key]) {
        merged[key] = localObj[key];
      }
    }
    
    for (const key in remoteObj) {
      if (remoteObj[key] !== baseObj[key]) {
        if (merged[key] !== localObj[key]) {
          // Conflict in this field, use remote (could be more sophisticated)
          merged[key] = remoteObj[key];
        }
      }
    }
    
    return {
      success: true,
      resolvedValue: merged,
      strategy: 'three_way_merge',
      confidence: 70,
      explanation: 'Merged object changes from both sides'
    };
  }

  // User preference-based resolution
  private resolveByUserPreference(conflict: DataConflict): ResolutionResult {
    const preferenceKey = `${conflict.entity}.${conflict.field}.resolution`;
    const preference = this.userPreferences.get(preferenceKey);
    
    if (preference === 'always_local') {
      return {
        success: true,
        resolvedValue: conflict.localValue,
        strategy: 'user_preference',
        confidence: 85,
        explanation: 'Resolved using user preference: always use local value'
      };
    } else if (preference === 'always_remote') {
      return {
        success: true,
        resolvedValue: conflict.remoteValue,
        strategy: 'user_preference',
        confidence: 85,
        explanation: 'Resolved using user preference: always use remote value'
      };
    }
    
    return {
      success: false,
      resolvedValue: conflict.localValue,
      strategy: 'user_preference',
      confidence: 0,
      explanation: 'No applicable user preference found'
    };
  }

  // Manual resolution requirement
  private requireManualResolution(conflict: DataConflict): ResolutionResult {
    return {
      success: true,
      resolvedValue: conflict.localValue, // Default to local until user decides
      strategy: 'manual_resolution',
      confidence: 0,
      explanation: 'Conflict requires manual user intervention',
      requiresUserConfirmation: true
    };
  }

  // Helper methods for strategy conditions
  private hasBusinessRuleViolation(conflict: DataConflict): boolean {
    return conflict.metadata.businessContext.businessRules.length > 0;
  }

  private canResolveByTimestamp(conflict: DataConflict): boolean {
    return conflict.metadata.localTimestamp !== conflict.metadata.remoteTimestamp;
  }

  private hasUserAuthorityDifference(conflict: DataConflict): boolean {
    const localAuth = this.getUserAuthority(conflict.metadata.localUser);
    const remoteAuth = this.getUserAuthority(conflict.metadata.remoteUser);
    return localAuth !== remoteAuth;
  }

  private isAccumulativeField(conflict: DataConflict): boolean {
    const accumulativeFields = ['quantity', 'count', 'total', 'amount'];
    return accumulativeFields.some(field => conflict.field.toLowerCase().includes(field)) ||
           conflict.metadata.fieldType === FieldType.QUANTITY;
  }

  private hasUserPreference(conflict: DataConflict): boolean {
    const preferenceKey = `${conflict.entity}.${conflict.field}.resolution`;
    return this.userPreferences.has(preferenceKey);
  }

  // Helper methods for resolution logic
  private getUserAuthority(userId: string): number {
    // This would integrate with user management system
    const authorities: Record<string, number> = {
      'admin': 100,
      'manager': 80,
      'supervisor': 60,
      'employee': 40,
      'temp': 20
    };
    
    return authorities[userId] || 40; // Default to employee level
  }

  private isAuthorizedForCancellation(userId: string): boolean {
    return this.getUserAuthority(userId) >= 60; // Supervisor and above
  }

  // Side effect application
  private async applySideEffects(sideEffects: SideEffect[]): Promise<void> {
    for (const effect of sideEffects) {
      try {
        await this.applySideEffect(effect);
      } catch (error) {
        console.error('[ConflictResolution] Failed to apply side effect:', error);
      }
    }
  }

  private async applySideEffect(effect: SideEffect): Promise<void> {
    switch (effect.type) {
      case 'update':
        // Update related data
        await this.updateRelatedData(effect.target, effect.data);
        break;
      case 'notify':
        // Send notification
        await this.sendNotification(effect.target, effect.action, effect.data);
        break;
      case 'log':
        // Log audit trail
        await this.logAuditTrail(effect.target, effect.action, effect.data);
        break;
      case 'cascade':
        // Cascade changes to dependent data
        await this.cascadeChanges(effect.target, effect.data);
        break;
    }
  }

  private async updateRelatedData(target: string, data: any): Promise<void> {
    // Implementation would update related database records
    console.log(`[ConflictResolution] Side effect: Update ${target}`, data);
  }

  private async sendNotification(target: string, action: string, data: any): Promise<void> {
    // Implementation would send notifications to users/systems
    console.log(`[ConflictResolution] Side effect: Notify ${target} about ${action}`, data);
  }

  private async logAuditTrail(target: string, action: string, data: any): Promise<void> {
    // Implementation would log to audit system
    await localStorage.set('audit_log', `audit_${Date.now()}`, {
      target,
      action,
      data,
      timestamp: new Date().toISOString()
    });
    console.log(`[ConflictResolution] Side effect: Logged ${action} to ${target}`, data);
  }

  private async cascadeChanges(target: string, data: any): Promise<void> {
    // Implementation would propagate changes to dependent entities
    console.log(`[ConflictResolution] Side effect: Cascade changes to ${target}`, data);
  }

  // User preference management
  private loadUserPreferences(): void {
    // Load from storage or API
    const stored = JSON.parse(window.localStorage.getItem('conflict_preferences') || '{}');
    this.userPreferences = new Map(Object.entries(stored));
  }

  public setUserPreference(entity: string, field: string, preference: string): void {
    const key = `${entity}.${field}.resolution`;
    this.userPreferences.set(key, preference);
    
    // Save to storage
    const obj = Object.fromEntries(this.userPreferences);
    window.localStorage.setItem('conflict_preferences', JSON.stringify(obj));
  }

  // Public interface methods
  public getActiveConflicts(): DataConflict[] {
    return Array.from(this.activeConflicts.values());
  }

  public getResolutionHistory(limit: number = 50): ResolutionResult[] {
    return Array.from(this.resolutionHistory.values()).slice(-limit);
  }

  public async manuallyResolveConflict(conflictId: string, resolvedValue: any): Promise<void> {
    const conflict = this.activeConflicts.get(conflictId);
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }
    
    const result: ResolutionResult = {
      success: true,
      resolvedValue,
      strategy: 'manual_override',
      confidence: 100,
      explanation: 'Manually resolved by user'
    };
    
    this.resolutionHistory.set(conflictId, result);
    this.activeConflicts.delete(conflictId);
    
    await EventBus.emit('system.data_synced', {
      type: 'conflict_manually_resolved',
      conflictId,
      resolvedValue
    }, 'ConflictResolution');
  }
}

// Create singleton instance
const conflictResolution = new ConflictResolutionEngine();

export default conflictResolution;
export {
  ConflictResolutionEngine,
  type DataConflict,
  type ResolutionResult,
  type ResolutionStrategy,
  ConflictType,
  ConflictSeverity,
  FieldType
};