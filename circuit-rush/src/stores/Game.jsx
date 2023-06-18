import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export default create(subscribeWithSelector((set) => {
  return {
		elapsedTime: 0,
    phase: 'ready',
    startLoading: () => {
      set((state) => {
        if (state.phase === 'ready') {
          return { phase: 'loading' };
        }
        return state;
      });
    },
		countdown: () => {
			set(() => {
				return { phase: 'countdown' };
			});
		},
    startGame: () => {
      set(() => {
        return { phase: 'playing', startTime: Date.now(), endTime: 0 };
      });
    },
    pause: () => {
      set((state) => {
        if (state.phase === 'playing') {
          const elapsedTime = Date.now() - state.startTime;
          return { phase: 'paused', pauseTime: Date.now(), elapsedTime };
        }
        return state;
      });
    },
   	resume: () => {
      set((state) => {
        if (state.phase === 'paused') {
          const newStartTime = Date.now() - state.elapsedTime;
          return { phase: 'playing', startTime: newStartTime, endTime: state.endTime, elapsedTime: state.elapsedTime };
        }
        return state;
      });
    },
    restart: () => {
      set((state) => {
        if (state.phase === 'playing' || state.phase === 'ended' || state.phase === 'paused') {
          return { phase: 'countdown' };
        }
        return state;
      });
    },
    end: () => {
      set((state) => {
        if (state.phase === 'playing') {
          return { phase: 'ended', endTime: Date.now() };
        }
        return state;
      });
    },
    quit: () => {
      set((state) => {
        if (state.phase === 'playing' || state.phase === 'ended' || state.phase === 'paused') {
          return { phase: 'ready' };
        }
        return state;
      });
    },
    startTime: 0,
    endTime: 0,
    pauseTime: 0
  };
}));
