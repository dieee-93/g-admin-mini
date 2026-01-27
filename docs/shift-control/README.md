# ShiftControl - Documentation Index

**Status**: ✅ Architecture design complete, ready for implementation
**Last Updated**: 2025-12-05

---

## 📖 Core Documents (Read These)

### 1. **SHIFT_CONTROL_UI_ARCHITECTURE_v2.md** ⭐ MASTER DOCUMENT

**Purpose**: Complete architecture specification
**Read this for**:
- Component Props Interfaces
- State Machine Transitions
- HookPoint Data Contracts
- Event Payloads Spec
- Close Validation Rules
- Handler Patterns
- Performance Optimization
- Testing Strategy

**Status**: ✅ Complete and ready for implementation
**Version**: 2.1

---

### 2. **SHIFT_CONTROL_IMPLEMENTATION_GUIDE.md**

**Purpose**: Step-by-step implementation guide
**Read this for**:
- Phase-by-phase implementation plan
- Code structure templates
- Integration checkpoints
- Testing milestones

**Use this**: During implementation phase

---

### 3. **SHIFT_LIFECYCLE_BY_CAPABILITY.md**

**Purpose**: Business logic reference matrix
**Read this for**:
- Which capabilities trigger which features
- Shift lifecycle variations by business model
- Cross-module event dependencies

**Use this**: When implementing validation rules or event handlers

---

### 4. **SHIFT_CONTROL_EXECUTION_PLAN.md**

**Purpose**: Detailed execution roadmap
**Read this for**:
- Task breakdown
- Dependencies and blockers
- Timeline estimates

**Use this**: For project planning

---

### 5. **INTEGRATION_GUIDE.md**

**Purpose**: Quick integration reference
**Read this for**:
- How to add ShiftControl to Dashboard
- How to register the module
- How other modules integrate with ShiftControl

**Use this**: During final integration phase

---

### 6. **RESEARCH_OPERATIONAL_VS_EMPLOYEE_SHIFTS.md**

**Purpose**: Research on shift concepts
**Read this for**:
- Why we chose "Operational Shifts" vs "Employee Shifts"
- Domain research and comparisons
- Architectural decisions rationale

**Use this**: For understanding design decisions

---

### 7. **IMPLEMENTATION_COMPLETE.md**

**Purpose**: Current implementation status
**Read this for**:
- What's already implemented
- What's pending
- Known issues and blockers

**Use this**: To check current state before continuing work

---

## 🗂️ Archived Documents

The `ARCHIVED/` folder contains:
- Old architecture versions (superseded by v2)
- Session summaries and prompts
- Preliminary analysis and research (now consolidated)
- Module-specific updates (already applied)

**You can safely ignore these files** unless you need historical context.

---

## 🚀 Quick Start

**New to ShiftControl?** Read in this order:

1. **SHIFT_CONTROL_UI_ARCHITECTURE_v2.md** (30 min) - Complete overview
2. **SHIFT_LIFECYCLE_BY_CAPABILITY.md** (15 min) - Business logic
3. **SHIFT_CONTROL_IMPLEMENTATION_GUIDE.md** (20 min) - How to implement

**Ready to implement?** Follow:

1. **SHIFT_CONTROL_EXECUTION_PLAN.md** - Get task list
2. **SHIFT_CONTROL_UI_ARCHITECTURE_v2.md** - Reference during coding
3. **INTEGRATION_GUIDE.md** - Final integration steps

---

## ⚠️ Critical Blockers

Before implementation, resolve:

1. **Staff Module Events** (BLOCKER)
   - Must emit `staff.employee.checked_in`
   - Must emit `staff.employee.checked_out`
   - Without these, staff indicators won't work

2. **Database Schema**
   - Table `operational_shifts` must exist
   - See types in SHIFT_CONTROL_UI_ARCHITECTURE_v2.md

---

## 📞 Need Help?

- **Architecture questions**: See SHIFT_CONTROL_UI_ARCHITECTURE_v2.md
- **Implementation doubts**: See SHIFT_CONTROL_IMPLEMENTATION_GUIDE.md
- **Integration issues**: See INTEGRATION_GUIDE.md
- **Business logic**: See SHIFT_LIFECYCLE_BY_CAPABILITY.md

---

**Maintained by**: G-Admin Team
**Architecture Design**: Claude Code (Sonnet 4.5) + User Collaboration
