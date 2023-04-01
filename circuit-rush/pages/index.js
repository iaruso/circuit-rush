import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

import styles from '@/styles/Home.module.css';
import variables from '@/styles/variables.module.scss';

export default function Home() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ canvas });
    
    function resizeRenderer() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
    resizeRenderer();
    window.addEventListener('resize', resizeRenderer);

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    
    gsap.to(cube.rotation, {
      duration: 2,
      x: Math.PI * 2,
      yoyo: true,
      repeat: -1,
      ease: 'power2.inOut',
    });

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeRenderer);
    };
  }, []);

  return (
    <div className={styles.container}>
      <canvas className={styles.canvas} ref={canvasRef} />
    </div>
  );
}
