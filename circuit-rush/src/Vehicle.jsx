import { useEffect, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { useTexture, Clone, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useControls } from 'leva'

// function Wheel() {
//   const wheelRef = useRef();
//   return (
//     <RigidBody ref={wheelRef} colliders="trimesh" restitution={0}>
//       <mesh castShadow position={[-1, 0.6, 1.5]} rotation={[0, 0, -Math.PI/2]}>
//         <cylinderGeometry args={[0.3, 0.3, 0.25, 64]} />
//         <meshStandardMaterial color={'#ff0000'} metalness={0} roughness={1} emissive={'#fff'} emissiveIntensity={1} />
//       </mesh>
//     </RigidBody>
//   );
// }

export default function Vehicle() {


  // const joint = useRevoluteJoint(vehicle, leftFrontWheel, [[-1, 0.5, 1.5], [0, 0, 0], [-1, 0.5, 1.5]]);
  
  return (
    <>
      
    </>
  );
}



/*

<mesh castShadow position={[-1, 0.5, 1.5]} rotation={[0, 0, -Math.PI/2]}>
        <cylinderGeometry args={[0.3,0.3,0.25,64]}/>
        <meshStandardMaterial color={'#ff0000'} metalness={0} roughness={1} emissive={'#fff'} emissiveIntensity={1}/>
      </mesh>
      <mesh castShadow position={[1, 0.5, 1.5]} rotation={[0, 0, -Math.PI/2]}>
        <cylinderGeometry args={[0.3,0.3,0.25,64]} />
        <meshStandardMaterial color={'#ff0000'} metalness={0} roughness={1} emissive={'#fff'} emissiveIntensity={1}/>
      </mesh>
      <mesh castShadow position={[-1, 0.5, -1.5]} rotation={[0, 0, -Math.PI/2]}>
        <cylinderGeometry args={[0.3,0.3,0.25,64]}/>
        <meshStandardMaterial color={'#ff0000'} metalness={0} roughness={1} emissive={'#fff'} emissiveIntensity={1}/>
      </mesh>
      <mesh castShadow position={[1, 0.5,-1.5]} rotation={[0, 0, -Math.PI/2]}>
        <cylinderGeometry args={[0.3,0.3,0.25,64]}/>
        <meshStandardMaterial color={'#ff0000'} metalness={0} roughness={1} emissive={'#fff'} emissiveIntensity={1}/>
      </mesh>

*/