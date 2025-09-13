import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventBusClass as EventBus } from '../../index';
import { createStaffTestModule, createSchedulingTestModule, createTestEventHandlers } from '../helpers/test-modules';
import { mockBusinessData } from '../helpers/mock-data';
import { PerformanceMeasurement, testConfigs } from '../helpers/test-utilities';

describe('EventBus - Staff Management Business Logic', () => {
  let eventBus: EventBus;
  let performance: PerformanceMeasurement;

  beforeEach(() => {
    eventBus = new EventBus(testConfigs.integration);
    performance = new PerformanceMeasurement();
    
    // Register all test handlers
    const handlers = createTestEventHandlers();
    for (const [handlerName, handler] of handlers.entries()) {
      eventBus.registerHandler(handlerName, handler);
    }
    
    vi.clearAllMocks();
  });

  describe('Staff Onboarding Workflow', () => {
    it('should handle complete staff onboarding process', async () => {
      const staffModule = createStaffTestModule();
      const schedulingModule = createSchedulingTestModule();
      
      await eventBus.registerModule(staffModule);
      await eventBus.registerModule(schedulingModule);

      const workflowEvents: any[] = [];
      eventBus.on('**', (event) => workflowEvents.push(event));

      const newStaff = mockBusinessData.staff[0];

      // 1. Initial staff creation
      await eventBus.emit('staff.created', {
        id: newStaff.id,
        personalInfo: {
          name: newStaff.name,
          email: newStaff.email,
          phone: newStaff.phone,
          address: newStaff.address
        },
        position: newStaff.position,
        department: newStaff.department,
        startDate: new Date().toISOString(),
        salary: newStaff.salary,
        status: 'pending_onboarding'
      });

      // 2. Document verification
      await eventBus.emit('staff.documents.submitted', {
        staffId: newStaff.id,
        documents: [
          { type: 'id', verified: true },
          { type: 'work_permit', verified: true },
          { type: 'food_safety_cert', verified: true }
        ]
      });

      // 3. Training assignment
      await eventBus.emit('staff.training.assigned', {
        staffId: newStaff.id,
        trainingModules: [
          'food_safety_basic',
          'pos_system_training',
          'customer_service'
        ],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });

      // 4. Training completion
      await eventBus.emit('staff.training.completed', {
        staffId: newStaff.id,
        moduleId: 'food_safety_basic',
        score: 95,
        completedAt: new Date().toISOString()
      });

      await eventBus.emit('staff.training.completed', {
        staffId: newStaff.id,
        moduleId: 'pos_system_training',
        score: 88,
        completedAt: new Date().toISOString()
      });

      await eventBus.emit('staff.training.completed', {
        staffId: newStaff.id,
        moduleId: 'customer_service',
        score: 92,
        completedAt: new Date().toISOString()
      });

      // 5. Uniform and equipment assignment
      await eventBus.emit('staff.equipment.assigned', {
        staffId: newStaff.id,
        items: [
          { type: 'uniform_shirt', size: 'M', quantity: 3 },
          { type: 'uniform_pants', size: 'M', quantity: 2 },
          { type: 'name_tag', customization: newStaff.name },
          { type: 'pos_login_credentials', username: `${newStaff.name.toLowerCase().replace(' ', '_')}` }
        ]
      });

      // 6. Schedule assignment
      await eventBus.emit('scheduling.staff.assigned', {
        staffId: newStaff.id,
        scheduleType: 'regular',
        shifts: [
          { day: 'monday', start: '09:00', end: '17:00' },
          { day: 'tuesday', start: '09:00', end: '17:00' },
          { day: 'wednesday', start: '09:00', end: '17:00' },
          { day: 'thursday', start: '09:00', end: '17:00' },
          { day: 'friday', start: '09:00', end: '17:00' }
        ]
      });

      // 7. Onboarding completion
      await eventBus.emit('staff.onboarding.completed', {
        staffId: newStaff.id,
        completedAt: new Date().toISOString(),
        supervisor: 'supervisor_001',
        notes: 'Excellent performance during onboarding process'
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify complete workflow
      const staffCreatedEvents = workflowEvents.filter(e => e.pattern === 'staff.created');
      const documentsSubmittedEvents = workflowEvents.filter(e => e.pattern === 'staff.documents.submitted');
      const trainingAssignedEvents = workflowEvents.filter(e => e.pattern === 'staff.training.assigned');
      const trainingCompletedEvents = workflowEvents.filter(e => e.pattern === 'staff.training.completed');
      const equipmentAssignedEvents = workflowEvents.filter(e => e.pattern === 'staff.equipment.assigned');
      const scheduleAssignedEvents = workflowEvents.filter(e => e.pattern === 'scheduling.staff.assigned');
      const onboardingCompletedEvents = workflowEvents.filter(e => e.pattern === 'staff.onboarding.completed');

      expect(staffCreatedEvents).toHaveLength(1);
      expect(documentsSubmittedEvents).toHaveLength(1);
      expect(trainingAssignedEvents).toHaveLength(1);
      expect(trainingCompletedEvents).toHaveLength(3);
      expect(equipmentAssignedEvents).toHaveLength(1);
      expect(scheduleAssignedEvents).toHaveLength(1);
      expect(onboardingCompletedEvents).toHaveLength(1);

      expect(staffCreatedEvents[0].payload.status).toBe('pending_onboarding');
      expect(trainingCompletedEvents.every(e => e.payload.score >= 85)).toBe(true);
    });

    it('should handle training failure and remediation', async () => {
      const staffModule = createStaffTestModule();
      await eventBus.registerModule(staffModule);

      const workflowEvents: any[] = [];
      eventBus.on('*', (event) => workflowEvents.push(event));

      const staffId = 'staff_001';

      // Training failure
      await eventBus.emit('staff.training.completed', {
        staffId,
        moduleId: 'food_safety_basic',
        score: 65, // Below passing threshold
        completedAt: new Date().toISOString()
      });

      // Remedial training assignment
      await eventBus.emit('staff.training.remedial.assigned', {
        staffId,
        originalModule: 'food_safety_basic',
        remedialModule: 'food_safety_remedial',
        reason: 'Below passing score of 75',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      });

      // Successful remedial completion
      await eventBus.emit('staff.training.completed', {
        staffId,
        moduleId: 'food_safety_remedial',
        score: 88,
        completedAt: new Date().toISOString(),
        isRemedial: true
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      const remedialEvents = workflowEvents.filter(e => e.pattern === 'staff.training.remedial.assigned');
      expect(remedialEvents).toHaveLength(1);
      expect(remedialEvents[0].payload.reason).toContain('Below passing score');
    });
  });

  describe('Performance Management Workflow', () => {
    it('should handle performance review process', async () => {
      const staffModule = createStaffTestModule();
      await eventBus.registerModule(staffModule);

      const workflowEvents: any[] = [];
      eventBus.on('*', (event) => workflowEvents.push(event));

      const staffId = 'staff_001';
      const reviewPeriod = '2024-Q1';

      // Performance review initiation
      await eventBus.emit('staff.performance.review.initiated', {
        staffId,
        reviewPeriod,
        reviewType: 'quarterly',
        reviewerId: 'manager_001',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      });

      // Self-assessment submission
      await eventBus.emit('staff.performance.self_assessment.submitted', {
        staffId,
        reviewPeriod,
        responses: {
          productivity: { score: 8, comments: 'Consistently meeting targets' },
          teamwork: { score: 9, comments: 'Great collaboration with kitchen team' },
          customer_service: { score: 8, comments: 'Positive customer feedback' },
          punctuality: { score: 9, comments: 'Always on time' }
        },
        submittedAt: new Date().toISOString()
      });

      // Manager evaluation
      await eventBus.emit('staff.performance.manager_evaluation.submitted', {
        staffId,
        reviewPeriod,
        evaluatorId: 'manager_001',
        scores: {
          productivity: 8,
          teamwork: 9,
          customer_service: 9,
          punctuality: 9,
          leadership: 7
        },
        strengths: ['Excellent customer service', 'Team player', 'Reliable'],
        areas_for_improvement: ['Leadership skills', 'Upselling techniques'],
        goals: [
          { description: 'Complete leadership training', deadline: '2024-06-30' },
          { description: 'Increase average ticket by 15%', deadline: '2024-09-30' }
        ],
        overallRating: 'exceeds_expectations'
      });

      // Performance review completion
      await eventBus.emit('staff.performance.review.completed', {
        staffId,
        reviewPeriod,
        finalScore: 8.4,
        rating: 'exceeds_expectations',
        salaryAdjustment: {
          type: 'increase',
          amount: 500,
          effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        completedAt: new Date().toISOString()
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const reviewEvents = workflowEvents.filter(e => e.pattern.includes('performance'));
      expect(reviewEvents.length).toBeGreaterThanOrEqual(4);

      const completedReview = workflowEvents.find(e => e.pattern === 'staff.performance.review.completed');
      expect(completedReview?.payload.rating).toBe('exceeds_expectations');
      expect(completedReview?.payload.salaryAdjustment.type).toBe('increase');
    });

    it('should handle performance improvement plan (PIP)', async () => {
      const staffModule = createStaffTestModule();
      await eventBus.registerModule(staffModule);

      const workflowEvents: any[] = [];
      eventBus.on('*', (event) => workflowEvents.push(event));

      const staffId = 'staff_002';

      // Poor performance identified
      await eventBus.emit('staff.performance.concern.identified', {
        staffId,
        concerns: [
          'Consistently late arrivals',
          'Customer complaints about service',
          'Not meeting sales targets'
        ],
        identifiedBy: 'manager_001',
        identifiedAt: new Date().toISOString()
      });

      // PIP creation
      await eventBus.emit('staff.pip.created', {
        staffId,
        reason: 'Multiple performance issues requiring immediate attention',
        duration: 90, // days
        requirements: [
          'Arrive on time for all scheduled shifts',
          'Complete customer service refresher training',
          'Achieve minimum sales targets for 3 consecutive weeks'
        ],
        checkInSchedule: 'weekly',
        createdBy: 'manager_001',
        startDate: new Date().toISOString()
      });

      // Weekly check-ins
      await eventBus.emit('staff.pip.checkin', {
        staffId,
        week: 1,
        punctualityScore: 7,
        salesPerformance: 85, // % of target
        customerFeedback: 'improved',
        managerNotes: 'Showing improvement in punctuality and attitude',
        nextSteps: ['Continue focus on sales techniques']
      });

      await eventBus.emit('staff.pip.checkin', {
        staffId,
        week: 2,
        punctualityScore: 9,
        salesPerformance: 95,
        customerFeedback: 'positive',
        managerNotes: 'Significant improvement across all areas',
        nextSteps: ['Maintain current performance level']
      });

      // PIP successful completion
      await eventBus.emit('staff.pip.completed', {
        staffId,
        outcome: 'successful',
        finalNotes: 'Staff member successfully addressed all performance concerns',
        completedAt: new Date().toISOString(),
        nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const pipEvents = workflowEvents.filter(e => e.pattern.includes('pip'));
      expect(pipEvents).toHaveLength(4); // created, 2 check-ins, completed

      const completedPip = workflowEvents.find(e => e.pattern === 'staff.pip.completed');
      expect(completedPip?.payload.outcome).toBe('successful');
    });
  });

  describe('Scheduling and Shift Management', () => {
    it('should handle shift swap requests', async () => {
      const staffModule = createStaffTestModule();
      const schedulingModule = createSchedulingTestModule();
      
      await eventBus.registerModule(staffModule);
      await eventBus.registerModule(schedulingModule);

      const workflowEvents: any[] = [];
      eventBus.on('*', (event) => workflowEvents.push(event));

      const requestingStaffId = 'staff_001';
      const targetStaffId = 'staff_002';
      const shiftDate = '2024-03-15';

      // Shift swap request
      await eventBus.emit('scheduling.shift_swap.requested', {
        requestId: 'swap_001',
        requestingStaff: requestingStaffId,
        targetStaff: targetStaffId,
        originalShift: {
          date: shiftDate,
          start: '09:00',
          end: '17:00',
          position: 'cashier'
        },
        targetShift: {
          date: '2024-03-16',
          start: '09:00',
          end: '17:00',
          position: 'cashier'
        },
        reason: 'Family emergency',
        requestedAt: new Date().toISOString()
      });

      // Manager approval
      await eventBus.emit('scheduling.shift_swap.approved', {
        requestId: 'swap_001',
        approvedBy: 'manager_001',
        approvedAt: new Date().toISOString(),
        conditions: ['Must find coverage if absent']
      });

      // Target staff acceptance
      await eventBus.emit('scheduling.shift_swap.accepted', {
        requestId: 'swap_001',
        acceptedBy: targetStaffId,
        acceptedAt: new Date().toISOString()
      });

      // Schedule update
      await eventBus.emit('scheduling.updated', {
        changes: [
          {
            staffId: requestingStaffId,
            date: '2024-03-16',
            newShift: { start: '09:00', end: '17:00', position: 'cashier' }
          },
          {
            staffId: targetStaffId,
            date: shiftDate,
            newShift: { start: '09:00', end: '17:00', position: 'cashier' }
          }
        ],
        updatedBy: 'system',
        reason: 'Approved shift swap'
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const swapEvents = workflowEvents.filter(e => e.pattern.includes('shift_swap'));
      expect(swapEvents).toHaveLength(3);

      const acceptedEvent = workflowEvents.find(e => e.pattern === 'scheduling.shift_swap.accepted');
      expect(acceptedEvent?.payload.acceptedBy).toBe(targetStaffId);
    });

    it('should handle time-off requests and approval workflow', async () => {
      const staffModule = createStaffTestModule();
      const schedulingModule = createSchedulingTestModule();
      
      await eventBus.registerModule(staffModule);
      await eventBus.registerModule(schedulingModule);

      const workflowEvents: any[] = [];
      eventBus.on('*', (event) => workflowEvents.push(event));

      const staffId = 'staff_001';

      // Time-off request
      await eventBus.emit('staff.timeoff.requested', {
        requestId: 'timeoff_001',
        staffId,
        type: 'vacation',
        startDate: '2024-04-01',
        endDate: '2024-04-05',
        totalDays: 5,
        reason: 'Family vacation',
        requestedAt: new Date().toISOString()
      });

      // Check coverage availability
      await eventBus.emit('scheduling.coverage.checked', {
        requestId: 'timeoff_001',
        dates: ['2024-04-01', '2024-04-02', '2024-04-03', '2024-04-04', '2024-04-05'],
        coverageStatus: {
          '2024-04-01': 'available',
          '2024-04-02': 'available',
          '2024-04-03': 'needs_coverage',
          '2024-04-04': 'available',
          '2024-04-05': 'available'
        }
      });

      // Coverage arranged
      await eventBus.emit('scheduling.coverage.arranged', {
        requestId: 'timeoff_001',
        date: '2024-04-03',
        coverageStaff: 'staff_003',
        shiftDetails: { start: '09:00', end: '17:00', position: 'cashier' }
      });

      // Manager approval
      await eventBus.emit('staff.timeoff.approved', {
        requestId: 'timeoff_001',
        approvedBy: 'manager_001',
        approvedAt: new Date().toISOString(),
        notes: 'Approved with coverage arranged'
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const timeoffEvents = workflowEvents.filter(e => e.pattern.includes('timeoff'));
      expect(timeoffEvents).toHaveLength(2);

      const approvedEvent = workflowEvents.find(e => e.pattern === 'staff.timeoff.approved');
      expect(approvedEvent?.payload.approvedBy).toBe('manager_001');
    });
  });

  describe('Staff Development and Training', () => {
    it('should handle continuous learning and certification tracking', async () => {
      performance.start('staff-development');

      const staffModule = createStaffTestModule();
      await eventBus.registerModule(staffModule);

      const workflowEvents: any[] = [];
      eventBus.on('*', (event) => workflowEvents.push(event));

      const staffId = 'staff_001';

      // Skill assessment
      await eventBus.emit('staff.skills.assessed', {
        staffId,
        assessment: {
          id: 'assessment_001',
          skills: {
            'food_safety': { level: 8, certified: true, expiryDate: '2025-03-01' },
            'customer_service': { level: 9, certified: true, expiryDate: null },
            'pos_operation': { level: 7, certified: true, expiryDate: null },
            'leadership': { level: 5, certified: false, expiryDate: null }
          },
          overallScore: 7.25,
          assessedBy: 'manager_001',
          assessedAt: new Date().toISOString()
        }
      });

      // Development plan creation
      await eventBus.emit('staff.development.plan_created', {
        staffId,
        planId: 'dev_plan_001',
        objectives: [
          {
            skill: 'leadership',
            currentLevel: 5,
            targetLevel: 8,
            timeline: '6 months',
            activities: ['Leadership workshop', 'Mentoring junior staff', 'Project management course']
          }
        ],
        createdBy: 'manager_001',
        createdAt: new Date().toISOString()
      });

      // Training enrollment
      await eventBus.emit('staff.training.enrolled', {
        staffId,
        courseId: 'leadership_fundamentals',
        courseName: 'Leadership Fundamentals',
        startDate: new Date().toISOString(),
        expectedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        format: 'online'
      });

      // Certification renewal
      await eventBus.emit('staff.certification.renewed', {
        staffId,
        certification: 'food_safety',
        newExpiryDate: '2026-03-01',
        renewedAt: new Date().toISOString(),
        issuingBody: 'National Restaurant Association'
      });

      performance.end('staff-development');

      await new Promise(resolve => setTimeout(resolve, 100));

      const developmentEvents = workflowEvents.filter(e => e.pattern.includes('development') || e.pattern.includes('skills') || e.pattern.includes('certification'));
      expect(developmentEvents).toHaveLength(3);

      const stats = performance.getStats('staff-development');
      expect(stats.avg).toBeLessThan(100); // Should complete quickly
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle staff termination workflow', async () => {
      const staffModule = createStaffTestModule();
      const schedulingModule = createSchedulingTestModule();
      
      await eventBus.registerModule(staffModule);
      await eventBus.registerModule(schedulingModule);

      const workflowEvents: any[] = [];
      eventBus.on('*', (event) => workflowEvents.push(event));

      const staffId = 'staff_002';

      // Termination initiation
      await eventBus.emit('staff.termination.initiated', {
        staffId,
        reason: 'voluntary_resignation',
        lastWorkingDay: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        initiatedBy: staffId, // Self-initiated
        noticeProvided: true
      });

      // Equipment return
      await eventBus.emit('staff.equipment.returned', {
        staffId,
        items: [
          { type: 'uniform_shirt', quantity: 3, condition: 'good' },
          { type: 'uniform_pants', quantity: 2, condition: 'good' },
          { type: 'name_tag', quantity: 1, condition: 'good' }
        ],
        returnedAt: new Date().toISOString()
      });

      // Access revocation
      await eventBus.emit('staff.access.revoked', {
        staffId,
        accessTypes: ['pos_system', 'building_entry', 'staff_portal'],
        revokedAt: new Date().toISOString(),
        revokedBy: 'manager_001'
      });

      // Schedule cleanup
      await eventBus.emit('scheduling.staff.removed', {
        staffId,
        effectiveDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        futureShiftsCount: 8,
        coverageRequired: true
      });

      // Final processing
      await eventBus.emit('staff.termination.completed', {
        staffId,
        completedAt: new Date().toISOString(),
        finalPayroll: {
          regularHours: 80,
          overtimeHours: 5,
          vacationPayout: 24,
          totalAmount: 2100
        },
        exitInterviewCompleted: true
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const terminationEvents = workflowEvents.filter(e => e.pattern.includes('termination') || e.pattern.includes('equipment.returned') || e.pattern.includes('access.revoked'));
      expect(terminationEvents).toHaveLength(4);

      const completedTermination = workflowEvents.find(e => e.pattern === 'staff.termination.completed');
      expect(completedTermination?.payload.exitInterviewCompleted).toBe(true);
    });

    it('should handle emergency contact and incident reporting', async () => {
      const staffModule = createStaffTestModule();
      await eventBus.registerModule(staffModule);

      const workflowEvents: any[] = [];
      eventBus.on('*', (event) => workflowEvents.push(event));

      const staffId = 'staff_001';

      // Workplace incident
      await eventBus.emit('staff.incident.reported', {
        incidentId: 'inc_001',
        staffId,
        type: 'injury',
        severity: 'minor',
        description: 'Minor cut while using knife in kitchen prep',
        location: 'kitchen',
        reportedBy: staffId,
        reportedAt: new Date().toISOString(),
        witnesses: ['staff_003', 'staff_004']
      });

      // First aid provided
      await eventBus.emit('staff.incident.first_aid_provided', {
        incidentId: 'inc_001',
        treatment: 'Cleaned wound and applied bandage',
        providedBy: 'manager_001',
        treatmentTime: new Date().toISOString()
      });

      // Emergency contact notification (if serious)
      // In this case, minor injury so no emergency contact needed
      
      // Incident investigation
      await eventBus.emit('staff.incident.investigated', {
        incidentId: 'inc_001',
        investigator: 'safety_officer_001',
        findings: 'Staff was not using cut-resistant gloves during prep work',
        recommendations: [
          'Mandatory use of cut-resistant gloves during knife work',
          'Additional knife safety training for all kitchen staff'
        ],
        investigatedAt: new Date().toISOString()
      });

      // Follow-up actions
      await eventBus.emit('staff.incident.action_plan_created', {
        incidentId: 'inc_001',
        actions: [
          { description: 'Purchase additional cut-resistant gloves', dueDate: '2024-03-20' },
          { description: 'Schedule knife safety refresher training', dueDate: '2024-03-25' }
        ],
        createdBy: 'manager_001'
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      const incidentEvents = workflowEvents.filter(e => e.pattern.includes('incident'));
      expect(incidentEvents).toHaveLength(4);

      const reportedIncident = workflowEvents.find(e => e.pattern === 'staff.incident.reported');
      expect(reportedIncident?.payload.severity).toBe('minor');
    });
  });

  describe('Integration with Other Systems', () => {
    it('should integrate with payroll system for labor cost tracking', async () => {
      const staffModule = createStaffTestModule();
      await eventBus.registerModule(staffModule);

      const workflowEvents: any[] = [];
      eventBus.on('*', (event) => workflowEvents.push(event));

      const staffId = 'staff_001';
      const payPeriod = '2024-03-01_to_2024-03-15';

      // Clock in
      await eventBus.emit('staff.time.clock_in', {
        staffId,
        timestamp: new Date('2024-03-01T09:00:00').toISOString(),
        location: 'main_register'
      });

      // Clock out
      await eventBus.emit('staff.time.clock_out', {
        staffId,
        timestamp: new Date('2024-03-01T17:30:00').toISOString(),
        location: 'main_register'
      });

      // Time adjustment (manager override)
      await eventBus.emit('staff.time.adjusted', {
        staffId,
        date: '2024-03-01',
        originalHours: 8.5,
        adjustedHours: 8.0,
        reason: 'Extended lunch break',
        adjustedBy: 'manager_001'
      });

      // Payroll calculation
      await eventBus.emit('staff.payroll.calculated', {
        staffId,
        payPeriod,
        regularHours: 80,
        overtimeHours: 4,
        hourlyRate: 15.50,
        regularPay: 1240.00,
        overtimePay: 93.00,
        grossPay: 1333.00,
        deductions: {
          taxes: 266.60,
          insurance: 45.00,
          retirement: 40.00
        },
        netPay: 981.40
      });

      await new Promise(resolve => setTimeout(resolve, 50));

      const payrollEvents = workflowEvents.filter(e => e.pattern.includes('time') || e.pattern.includes('payroll'));
      expect(payrollEvents).toHaveLength(4);

      const payrollCalculation = workflowEvents.find(e => e.pattern === 'staff.payroll.calculated');
      expect(payrollCalculation?.payload.netPay).toBe(981.40);
    });
  });
});