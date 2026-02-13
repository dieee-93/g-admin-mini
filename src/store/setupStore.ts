import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { STEP_GROUPS } from '@/pages/setup/config/setupSteps';

import { logger } from '@/lib/logging';
export interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

export interface AdminUserData {
  email: string;
  password: string;
  full_name: string;
}

interface SetupState {
  currentGroup: number;
  currentSubStep: number;
  userName: string;
  supabaseCredentials: SupabaseCredentials | null;
  adminUserData: AdminUserData | null;
  timestamp: number;
}

interface SetupActions {
  setUserName: (name: string) => void;
  setSupabaseCredentials: (credentials: SupabaseCredentials) => void;
  setAdminUserData: (data: AdminUserData) => void;

  nextStep: () => void;
  prevStep: () => void;
  jumpToStep: (groupIndex: number, subStepIndex?: number, force?: boolean) => void;

  reset: () => void;
  fillWithTestData: () => void;
}

type SetupStore = SetupState & SetupActions;

const initialState: SetupState = {
  currentGroup: 0,
  currentSubStep: 0,
  userName: '',
  supabaseCredentials: null,
  adminUserData: null,
  timestamp: Date.now(),
};

const canProceedToStep = (state: SetupState, targetGroup: number): boolean => {
  const group = STEP_GROUPS[targetGroup];
  if (!group || !group.required) {
    return true;
  }

  if (targetGroup > 0 && !state.userName) {
    return false;
  }

  if (targetGroup > 1 && !state.supabaseCredentials) {
    return false;
  }

  if (targetGroup > 2 && !state.adminUserData) {
    return false;
  }

  return true;
};

export const useSetupStore = create<SetupStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setUserName: (name) => set({ userName: name, timestamp: Date.now() }, false, 'setUserName'),
        setSupabaseCredentials: (credentials) => set({ supabaseCredentials: credentials, timestamp: Date.now() }, false, 'setSupabaseCredentials'),
        setAdminUserData: (_data) => set({ adminUserData: _data, timestamp: Date.now() }, false, 'setAdminUserData'),

        nextStep: () => {
          const { currentGroup, currentSubStep } = get();
          const currentGroupData = STEP_GROUPS[currentGroup];

          if (currentSubStep < currentGroupData.subSteps.length - 1) {
            set({ currentSubStep: currentSubStep + 1, timestamp: Date.now() }, false, 'nextSubStep');
          } else if (currentGroup < STEP_GROUPS.length - 1) {
            if (canProceedToStep(get(), currentGroup + 1)) {
              set({ currentGroup: currentGroup + 1, currentSubStep: 0, timestamp: Date.now() }, false, 'nextGroup');
            } else {
              logger.warn('App', 'Cannot proceed to next group, prerequisites not met.');
            }
          }
        },

        prevStep: () => {
          const { currentGroup, currentSubStep } = get();

          if (currentSubStep > 0) {
            set({ currentSubStep: currentSubStep - 1, timestamp: Date.now() }, false, 'prevSubStep');
          } else if (currentGroup > 0) {
            const prevGroup = STEP_GROUPS[currentGroup - 1];
            set({
              currentGroup: currentGroup - 1,
              currentSubStep: prevGroup.subSteps.length - 1,
              timestamp: Date.now(),
            }, false, 'prevGroup');
          }
        },

        jumpToStep: (groupIndex, subStepIndex = 0, force = false) => {
          if (force || canProceedToStep(get(), groupIndex)) {
            set({ currentGroup: groupIndex, currentSubStep: subStepIndex, timestamp: Date.now() }, false, 'jumpToStep');
            if (force) {
              logger.info('App', `🚀 Force jumping to group ${groupIndex} (dev mode)`);
            }
          } else {
            logger.warn('App', `Cannot jump to group ${groupIndex}, prerequisites not met.`);
          }
        },

        reset: () => set(initialState, false, 'reset'),
        fillWithTestData: () => set({
          userName: 'Test User',
          supabaseCredentials: {
            url: 'https://test.supabase.co',
            anonKey: 'test-anon-key'
          },
          adminUserData: {
            email: 'test@test.com',
            password: 'password',
            full_name: 'Test Admin'
          },
          timestamp: Date.now(),
        }, false, 'fillWithTestData'),
      }),
      {
        name: 'g-admin-setup-progress',
        // Security: Do NOT persist sensitive setup data
        partialize: (state) => ({
          currentGroup: state.currentGroup, // ✅ Safe - wizard progress
          currentSubStep: state.currentSubStep, // ✅ Safe - wizard progress
          userName: state.userName, // ✅ Safe - non-sensitive
          // ❌ supabaseCredentials: Contains API keys - do not persist
          // ❌ adminUserData: Contains PASSWORD IN PLAIN TEXT - NEVER persist
          timestamp: state.timestamp, // ✅ Safe
        })
      }
    ),
    {
      name: 'SetupStore',
    }
  )
);
