import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { STEP_GROUPS } from '@/pages/setup/config/setupSteps';

export interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

export interface AdminUserData {
  email: string;
  password: string;
  fullName: string;
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
  jumpToStep: (groupIndex: number, subStepIndex?: number) => void;

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
        setAdminUserData: (data) => set({ adminUserData: data, timestamp: Date.now() }, false, 'setAdminUserData'),

        nextStep: () => {
          const { currentGroup, currentSubStep } = get();
          const currentGroupData = STEP_GROUPS[currentGroup];

          if (currentSubStep < currentGroupData.subSteps.length - 1) {
            set({ currentSubStep: currentSubStep + 1, timestamp: Date.now() }, false, 'nextSubStep');
          } else if (currentGroup < STEP_GROUPS.length - 1) {
            if (canProceedToStep(get(), currentGroup + 1)) {
              set({ currentGroup: currentGroup + 1, currentSubStep: 0, timestamp: Date.now() }, false, 'nextGroup');
            } else {
              console.warn('Cannot proceed to next group, prerequisites not met.');
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

        jumpToStep: (groupIndex, subStepIndex = 0) => {
            if (canProceedToStep(get(), groupIndex)) {
                set({ currentGroup: groupIndex, currentSubStep: subStepIndex, timestamp: Date.now() }, false, 'jumpToStep');
            } else {
                console.warn(`Cannot jump to group ${groupIndex}, prerequisites not met.`);
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
                fullName: 'Test Admin'
            },
            timestamp: Date.now(),
        }, false, 'fillWithTestData'),
      }),
      {
        name: 'g-admin-setup-progress',
      }
    ),
    {
      name: 'SetupStore',
    }
  )
);
