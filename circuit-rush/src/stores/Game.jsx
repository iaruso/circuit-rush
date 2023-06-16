import create from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export default create(subscribeWithSelector((set) => {
  return {
    phase: 'ready',
    startLoading: () => {
      set((state) => {
        if (state.phase === 'ready') {
          return { phase: 'loading' };
        }
        return state;
      });
    },
    startGame: () => {
      set((state) => {
        if (state.phase === 'loading') {
          return { phase: 'playing', startTime: Date.now() };
        }
        return state;
      });
    },
    restart: () => {
      set((state) => {
        if (state.phase === 'playing' || state.phase === 'ended') {
          return { phase: 'ready' };
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
				if (state.phase === 'playing' || state.phase === 'ended') {
					return { phase: 'ready' };
				}
				return state;
			});
		},
    startTime: 0,
    endTime: 0
  };
}));