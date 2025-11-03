# Background Services

This directory contains background services that run automatically when the app starts.

## Services

### 📅 Appointment Reminder Service

**Location**: `appointmentReminders.ts`

**Purpose**: Automatically sends reminders for upcoming appointments:
- 24 hours before (email)
- 2 hours before (email + SMS if configured)

**Status**: ⚠️ **Development Mode**
- Currently runs in browser using setInterval
- Uses console.log instead of actual email sends
- **MUST be moved to backend for production**

---

## Production Setup Requirements

### 🚨 Critical: Move to Backend

The appointment reminder service currently runs in the browser for development purposes. For production, it **MUST** run on the backend.

**Recommended Approaches**:

#### Option 1: Supabase Edge Functions (Recommended)

Create a Supabase Edge Function with cron trigger:

```bash
# Create edge function
supabase functions new appointment-reminders

# Add cron schedule in supabase/functions/appointment-reminders/index.ts
Deno.cron("appointment-reminders", "0 * * * *", async () => {
  // Check for pending reminders every hour
  await checkAndSendReminders();
});
```

**Benefits**:
- Native integration with Supabase
- Serverless (no infrastructure management)
- Built-in cron scheduling
- Access to Supabase client

#### Option 2: Backend Node.js Service

Deploy the service as a standalone Node.js process:

```typescript
// backend/services/appointmentReminders.ts
import { CronJob } from 'cron';
import { appointmentReminderService } from './appointmentReminders';

const job = new CronJob('0 * * * *', () => {
  appointmentReminderService.checkReminders();
});

job.start();
```

**Benefits**:
- Full control over scheduling
- Can run alongside other backend services
- Easier debugging and monitoring

---

### 📧 Email Service Integration

**Current Status**: Mock/stub implementation that logs to console

**Production Requirements**:

#### Recommended Services:

1. **Resend** (Recommended for Supabase)
   ```typescript
   import { Resend } from 'resend';

   const resend = new Resend(process.env.RESEND_API_KEY);

   await resend.emails.send({
     from: 'appointments@yourdomain.com',
     to: customer.email,
     subject: 'Appointment Reminder',
     html: emailTemplate,
   });
   ```

2. **SendGrid**
   ```typescript
   import sgMail from '@sendgrid/mail';

   sgMail.setApiKey(process.env.SENDGRID_API_KEY);

   await sgMail.send({
     to: customer.email,
     from: 'appointments@yourdomain.com',
     subject: 'Appointment Reminder',
     html: emailTemplate,
   });
   ```

3. **AWS SES** (For high volume)
4. **Supabase Auth Emails** (If using Supabase Auth)

#### Email Templates

Create HTML email templates in `src/services/email-templates/`:

```
email-templates/
├── appointment-confirmation.html
├── appointment-reminder-24h.html
├── appointment-reminder-2h.html
└── appointment-cancelled.html
```

---

### 📱 SMS Service Integration (Optional)

**Current Status**: Not implemented

**Production Requirements** (if SMS reminders needed):

#### Recommended Services:

1. **Twilio**
   ```typescript
   import twilio from 'twilio';

   const client = twilio(
     process.env.TWILIO_ACCOUNT_SID,
     process.env.TWILIO_AUTH_TOKEN
   );

   await client.messages.create({
     to: customer.phone,
     from: process.env.TWILIO_PHONE_NUMBER,
     body: 'Reminder: Haircut appointment in 2 hours...',
   });
   ```

2. **AWS SNS**
3. **Vonage (formerly Nexmo)**

---

### 🔔 Push Notifications (Optional)

**Current Status**: Not implemented

**Production Requirements** (for mobile apps):

1. **Firebase Cloud Messaging (FCM)**
2. **OneSignal**
3. **Expo Push Notifications** (if using Expo)

---

## Environment Variables

Add to `.env`:

```bash
# Email Service
EMAIL_SERVICE=resend  # or sendgrid, ses, etc.
RESEND_API_KEY=your_api_key_here
EMAIL_FROM=appointments@yourdomain.com

# SMS Service (optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Push Notifications (optional)
FCM_SERVER_KEY=your_fcm_key

# App URLs
APP_URL=https://yourdomain.com
```

---

## Testing

### Unit Tests

```bash
pnpm test src/services/__tests__/appointmentReminders.test.ts
```

### Integration Tests

```bash
pnpm test src/services/__tests__/appointmentBookingFlow.integration.test.ts
```

### Manual Testing

1. Create a test appointment 25 hours in future
2. Wait for reminder service to check (or trigger manually)
3. Verify reminder is sent and `reminder_sent_24h` is updated

```typescript
import { appointmentReminderService } from '@/services';

// Send test reminder
await appointmentReminderService.sendTestReminder('appointment-id');
```

---

## Monitoring & Logging

### Production Monitoring

**Recommended**:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Datadog** - Performance monitoring
- **PagerDuty** - Alerting

### Metrics to Track

- Reminders sent (24h, 2h)
- Delivery success rate
- Failed deliveries (email/SMS)
- Average delivery time
- Reminder effectiveness (no-show rate before/after)

### Health Checks

Create health check endpoint:

```typescript
// backend/routes/health.ts
app.get('/health/reminders', async (req, res) => {
  const status = appointmentReminderService.getStatus();

  res.json({
    status: status.isRunning ? 'healthy' : 'unhealthy',
    uptime: process.uptime(),
    lastCheck: status.lastCheckTime,
    pendingReminders: status.pendingCount,
  });
});
```

---

## Migration Checklist

- [ ] Choose backend deployment strategy (Supabase Edge Functions vs Node.js)
- [ ] Select and configure email service
- [ ] Create email templates
- [ ] Set up environment variables
- [ ] Move reminder service to backend
- [ ] Configure cron schedule
- [ ] Set up monitoring and alerts
- [ ] Test with real appointments
- [ ] Monitor delivery rates
- [ ] Optional: Configure SMS service
- [ ] Optional: Configure push notifications
- [ ] Document runbooks for common issues

---

## Common Issues

### Issue: Reminders not sending

**Causes**:
1. Service not running
2. Email service credentials invalid
3. No appointments in reminder window

**Debug**:
```typescript
console.log(appointmentReminderService.getStatus());
```

### Issue: Duplicate reminders

**Causes**:
1. Multiple service instances running
2. `reminder_sent_24h` not being updated

**Fix**:
- Ensure only one service instance
- Check database update permissions

### Issue: Wrong timezone

**Causes**:
1. Server timezone differs from business timezone
2. `scheduled_time` not in UTC

**Fix**:
- Store all times in UTC
- Convert to local timezone for display only

---

## Related Documentation

- [Appointments Implementation Roadmap](../../system-architecture-master-plan/IMPLEMENTATION_ROADMAP_DISTRIBUTED_FEATURES.md)
- [Sales Module Documentation](../pages/admin/operations/sales/README.md)
- [Scheduling Module Documentation](../pages/admin/resources/scheduling/README.md)
- [Customer App Documentation](../pages/app/README.md)

---

## License

Internal use only - G-Mini Project
