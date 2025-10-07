import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ActivityType } from '@prisma/client';

interface SessionState {
  isActive: boolean;
  sessionId: string | null;
  startTime: Date | null;
  elapsedSeconds: number;
  activityType: ActivityType;
  assignmentId: string | null;
  notes: string;
  focusScore: number | null;
  isPaused: boolean;
  lastSaveTime: Date | null;
}

interface SessionActions {
  startSession: (assignmentId?: string, activityType?: ActivityType) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => Promise<void>;
  updateElapsedTime: (seconds: number) => void;
  updateActivityType: (type: ActivityType) => void;
  updateAssignment: (id: string | null) => void;
  updateNotes: (notes: string) => void;
  updateFocusScore: (score: number | null) => void;
  setLastSaveTime: (time: Date) => void;
  resetSession: () => void;
}

type SessionStore = SessionState & SessionActions;

const initialState: SessionState = {
  isActive: false,
  sessionId: null,
  startTime: null,
  elapsedSeconds: 0,
  activityType: ActivityType.CODING,
  assignmentId: null,
  notes: '',
  focusScore: null,
  isPaused: false,
  lastSaveTime: null,
};

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      startSession: (assignmentId?: string, activityType?: ActivityType) => {
        const sessionId = crypto.randomUUID();
        set({
          isActive: true,
          sessionId,
          startTime: new Date(),
          elapsedSeconds: 0,
          activityType: activityType || ActivityType.CODING,
          assignmentId: assignmentId || null,
          notes: '',
          focusScore: null,
          isPaused: false,
          lastSaveTime: null,
        });
      },

      pauseSession: () => {
        set({ isPaused: true });
      },

      resumeSession: () => {
        set({ isPaused: false });
      },

      stopSession: async () => {
        const state = get();
        if (!state.isActive || !state.sessionId) return;

        // Save final session to API
        try {
          const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: state.sessionId,
              assignmentId: state.assignmentId,
              startTime: state.startTime,
              endTime: new Date(),
              duration: Math.floor(state.elapsedSeconds / 60),
              activityType: state.activityType,
              focusScore: state.focusScore ? Math.min(100, state.focusScore * 10) : null,
              notes: state.notes || null,
            }),
          });

          if (!response.ok) {
            console.error('Failed to save session');
          }
        } catch (error) {
          console.error('Error saving session:', error);
        }

        set(initialState);
      },

      updateElapsedTime: (seconds: number) => {
        set({ elapsedSeconds: seconds });
      },

      updateActivityType: (type: ActivityType) => {
        set({ activityType: type });
      },

      updateAssignment: (id: string | null) => {
        set({ assignmentId: id });
      },

      updateNotes: (notes: string) => {
        set({ notes });
      },

      updateFocusScore: (score: number | null) => {
        set({ focusScore: score });
      },

      setLastSaveTime: (time: Date) => {
        set({ lastSaveTime: time });
      },

      resetSession: () => {
        set(initialState);
      },
    }),
    {
      name: 'session-storage',
      partialize: (state) => ({
        isActive: state.isActive,
        sessionId: state.sessionId,
        startTime: state.startTime,
        elapsedSeconds: state.elapsedSeconds,
        activityType: state.activityType,
        assignmentId: state.assignmentId,
        notes: state.notes,
        focusScore: state.focusScore,
        isPaused: state.isPaused,
      }),
    }
  )
);
