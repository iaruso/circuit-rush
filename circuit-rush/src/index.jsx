import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'
import { useControls } from 'leva'

const root = ReactDOM.createRoot(document.querySelector('#root'))

function App() {
  const settings = useControls({
    bg: '#f4f4f4',
  });

  return (
    <Canvas
      shadows
      camera={{
        fov: 45,
        near: 0.1,
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
