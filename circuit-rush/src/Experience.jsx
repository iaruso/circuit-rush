import { OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import * as THREE from 'three';


export default function Experience()
{
    const vertexShader = `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;

    void main() {
        vec4 color2 = vec4(1.0, 0.5, 0.0, 1.0); // dark orange
        vec4 color1 = vec4(1.0, 0.8, 0.0, 1.0); // light orange
        
        vec2 p = -1.0 + 2.0 * vUv;
        float r = length(p);
        float a = atan(p.y, p.x);
        
        if (a < 0.0) {
            a += 2.0 * 3.14159265359;
        }
        
        
            gl_FragColor = mix(color1, color2, r);
        
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      amplitude: { value: 0.2 },
    },
    vertexShader,
    fragmentShader,
  });
    return <>

        <Perf position="top-left" />

        <OrbitControls makeDefault />

        <directionalLight castShadow position={ [ 1, 2, 3 ] } intensity={ 1.5 } />
        <ambientLight intensity={ 0.5 } />

        <mesh castShadow position={ [ - 2, 2, 0 ] }>
            <sphereGeometry />
            <meshStandardMaterial color="orange" />
        </mesh>

        <mesh castShadow position={ [ 2, 2, 0 ] }>
            <boxGeometry />
            <meshStandardMaterial color="mediumpurple" />
        </mesh>

        <mesh receiveShadow rotation={[-3.14159265359/2,0,0]} material={material}>
            <planeGeometry args={[100, 100]} />

        </mesh>


    </>
}