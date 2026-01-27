# Gamification (`/modules/gamification`)

## Overview
The Gamification module drives user engagement through achievements, quests, and rewards. It serves as a horizontal layer that listens to events across the system (Sales, Staff, Materials) to award progress and unlock capabilities.

## 🏗️ Architecture
**Type**: Enhancement Module
**Category**: Engagement

This module operates primarily as a **Listener/Observer**, consuming events from multiple domains and providing UI feedback via badges and widgets.

### Key Integration Points
| Integration | Type | Description |
|-------------|------|-------------|
| **Sales** | Consumer | Tracks `order_completed` to award sales achievements. |
| **Inventory** | Consumer | Tracks `stock_updated` for inventory management badges. |
| **Dashboard** | Provider | Injects "My Progress" and "Leaderboard" widgets. |
| **Navigation** | Provider | Adds achievement badges to the sidebar. |

---

## Features
- **Achievement System**: Unlockable badges based on system activity.
- **Progress Tracking**: XP and Leveling system for employees.
- **Leaderboards**: Competitive metrics for sales and efficiency.
- **Notifications**: Real-time toasts when achievements are unlocked.

---

## 🪝 Hooks & Extension Points

### Provided Hooks
#### 1. `app.init`
- **Purpose**: Global initialization of the achievement notification system.
- **Priority**: `100` (High)
- **Component**: `<AchievementNotificationsInit />`

#### 2. `dashboard.widgets`
- **Purpose**: Display gamification status on the dashboard.
- **Priority**: `60`
- **Component**: `<GamificationWidget />` (Lazy loaded)

#### 3. `navigation.badges`
- **Purpose**: Visual indicators of new achievements in the navigation menu.

### Consumed Events (`EventBus`)
- `sales.order_completed`
- `materials.stock_updated`
- `staff.shift_completed`

---

## 🔌 Public API (`exports`)

### Methods
```typescript
// Get user progress
const progress = await registry.getExports('gamification').getProgress(userId);
// { level: 5, achievements: [...] }

// Manually unlock achievement (e.g. for custom admin actions)
await registry.getExports('gamification').unlockAchievement('FIRST_SALE', userId);
```

---

## 🚦 Future Enhancements
- **Quest System**: Daily/Weekly challenges (e.g., "Sell 5 Premium Plans").
- **Reward Store**: Exchange XP for real-world or system perks.
- **Team Challenges**: Group-based achievements.

---

**Last Updated**: 2025-01-25
**Module ID**: `gamification`
