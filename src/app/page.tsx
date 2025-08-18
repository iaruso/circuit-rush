import Scene from '@/components/scene';
import { ControlsProvider } from '@/context/use-controls';

export default function Main() {
  return (
    <div className='h-screen w-screen'>
      <ControlsProvider>
        <Scene />
      </ControlsProvider>
    </div>
  )
}
