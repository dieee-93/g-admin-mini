import { WelcomeStep } from '../steps/welcome/WelcomeStep';
import { AdminUserCreationStep } from '../steps/system-setup/admin-user-creation';
import { SupabaseConnectionStep } from '../steps/infrastructure/supabase-connection';
import { DatabaseSetupStep } from '../steps/database-setup/DatabaseSetupStep';
import { SystemVerification } from '../steps/system-verification/SystemVerification';
import { BusinessModelStep } from '../steps/business-setup/business-model/BusinessModelStep';
import { BasicSystemConfig } from '../steps/basic-system-config/BasicSystemConfig';
import { SetupSummary } from '../steps/setup-summary/SetupSummary';
import { FinishStep } from '../steps/FinishStep';

export const STEP_COMPONENTS: Record<string, React.ComponentType<any>> = {
  welcome: WelcomeStep,
  'admin-user': AdminUserCreationStep,
  supabase: SupabaseConnectionStep,
  database: DatabaseSetupStep,
  verification: SystemVerification,
  'business-model': BusinessModelStep,
  'basic-config': BasicSystemConfig,
  summary: SetupSummary,
  finish: FinishStep,
};
