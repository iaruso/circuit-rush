import { useRef, useEffect } from 'react';
import * as THREE from 'three'; 
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { gsap } from 'gsap';

import styles from '@/styles/Home.module.css';
import variables from '@/styles/variables.module.scss';

export default function Home() {
  const canvasRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // white background
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ canvas });
    
    const planeGeometry = new THREE.PlaneGeometry(2, 5);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controlsRef.current = controls;

    function resizeRenderer() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
    resizeRenderer();
    window.addEventListener('resize', resizeRenderer);

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      controls.update();
    }
    animate();
    
    if (typeof window !== 'undefined') {
      const dat = require('dat.gui');
      const gui = new dat.GUI();
    
      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/');
      loader.setDRACOLoader(dracoLoader);
      loader.load('/assets/models/car.gltf', (gltf) => {
        const car = gltf.scene;
        car.scale.set(0.25, 0.25, 0.25);
        car.position.set(0,0,2.5)
        scene.add(car);
        const carMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          metalness: 0.5,
          roughness: 0.5,
        });

        const controls = {
          wheelRotation: 10
        };
        const frontRightWheel = car.getObjectByName('Front_Right_Wheel');
        const frontLeftWheel = car.getObjectByName('Front_Left_Wheel');
        const wheelFolder = gui.addFolder('Wheel Rotation');
        wheelFolder.add(controls, 'wheelRotation', -180, 180).min(-20).max(20).step(1)
                  .onChange((value) => {
                    frontRightWheel.rotation.y = (Math.PI / 180) * value;
                    frontLeftWheel.rotation.y = (Math.PI / 180) * value;
                  });
        frontRightWheel.rotation.y = (Math.PI / 180) * controls.wheelRotation;
        frontLeftWheel.rotation.y = (Math.PI / 180) * controls.wheelRotation;
      });
    
    }

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
