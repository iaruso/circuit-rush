import { ViewTransition } from 'react';
import Scene from '@/components/scene';
import { ControlsProvider } from '@/context/use-controls';

export default function PlayPage() {
  return (
    <ViewTransition name='game-area'>
      <div className='h-screen w-screen'>
        <ControlsProvider>
          <Scene />
        </ControlsProvider>
      </div>
    </ViewTransition>
  )
}
