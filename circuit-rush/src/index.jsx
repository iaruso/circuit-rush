import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
// import { Pixelation, EffectComposer } from '@react-three/postprocessing'





import Experience from './Experience.jsx'
import { useControls } from 'leva'

const root = ReactDOM.createRoot(document.querySelector('#root'))

function App() {
  const settings = useControls({
    bg: '#f4f5f7',
  });

  return (
    <Canvas
      shadows={'soft'}
      camera={{
        fov: 45,
        near: 0.01,
        far: 1000,
        position: [4, 2, 6],
      }}
      style={{ backgroundColor: settings.bg }}
    >
        <Experience />
    </Canvas>
  );
}

root.render(<App />);
