import './style.css';
import ReactDOM from 'react-dom';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience.jsx';
import { useControls } from 'leva';
import UserControls from './UserControls';

const root = ReactDOM.createRoot(document.querySelector('#root'));
function App() {
  const settings = useControls({
    bg: '#f4f5f7',
  });
  
  return (
		<UserControls>
			<Canvas
				shadows={'soft'}
				camera={{
					fov: 45,
					near: 0.01,
					far: 1000,
					position: [0,0,0],
				}}
				style={{ backgroundColor: settings.bg }}
			>
				<color attach="background" args={['#f4f5f7']} />
				<Experience />
			</Canvas>
		</UserControls>
  );
}

root.render(<App />);
