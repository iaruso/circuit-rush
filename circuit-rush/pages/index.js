import { useRef, useEffect, useState } from 'react';
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
    
    const planeGeometry = new THREE.PlaneGeometry(20, 50);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(0, -1, 0);
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

    
      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      const rotations = {
        wheelSideRotation: 0,
        wheelRotation: 0
      };
      dracoLoader.setDecoderPath('/draco/');
      loader.setDRACOLoader(dracoLoader);

      let frontRightWheel;
      let frontLeftWheel;
      let rearWheels;



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
        car.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.material = carMaterial;
          }
        });
        const axisHelper = new THREE.AxesHelper(10)
        frontRightWheel = car.getObjectByName('Front_Right_Wheel');
        frontRightWheel.add(axisHelper);
        frontRightWheel.rotation.order = 'YXZ';
        frontLeftWheel = car.getObjectByName('Front_Left_Wheel');
        frontLeftWheel.rotation.order = 'YXZ';
        rearWheels = car.getObjectByName('Rear_Wheels');
        animateCar();
      });

      function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        controls.update();
      }
      animate();
      
      function animateCar(){
        requestAnimationFrame(animateCar);
        renderer.render(scene, camera);
        controls.update();
        frontRightWheel.rotation.y = (Math.PI / 180) * rotations.wheelSideRotation;
        frontLeftWheel.rotation.y = (Math.PI / 180) * rotations.wheelSideRotation;
        rearWheels.rotation.x = (Math.PI / 180) * rotations.wheelRotation;
      }
      let wheelIntervalId = null;
      let leftDirection = false;
      let rightDirection = false;
      const handling = 5;
      const maxRotation = 20;
      const minRotation = -20;

function handleKeyDown(event) {
  
  switch (event.keyCode) {
    case 37:
      clearInterval(wheelIntervalId);
      wheelIntervalId = null;
      leftDirection = true;
      wheelIntervalId = setInterval(() => {
        rotations.wheelSideRotation = Math.min(rotations.wheelSideRotation + handling, maxRotation);
        if (rotations.wheelSideRotation === maxRotation) clearInterval(wheelIntervalId);
      }, 20);
      break;
    case 38:
      // rotations.wheelRotation = rotations.wheelRotation + handling;
      break;
    case 39:
      clearInterval(wheelIntervalId);
      wheelIntervalId = null;
      rightDirection = true;
      wheelIntervalId = setInterval(() => {
        rotations.wheelSideRotation = Math.max(rotations.wheelSideRotation - handling, minRotation);
        if (rotations.wheelSideRotation === minRotation) clearInterval(wheelIntervalId);
      }, 20);
      break;
    default:
      break;
  }
}

function handleKeyUp(event) {
  switch (event.keyCode) {
    case 37:
      leftDirection = false;
      clearInterval(wheelIntervalId);
      wheelIntervalId = null;
      let limit = 0;
      rightDirection ? limit = minRotation : limit = 0;
        wheelIntervalId = setInterval(() => {
          rotations.wheelSideRotation = Math.max(rotations.wheelSideRotation - handling, limit);
          if (rotations.wheelSideRotation <= limit) clearInterval(wheelIntervalId);
        }, 20);
      break;
    case 38:

      break;
    case 39:
      clearInterval(wheelIntervalId);
      rightDirection = false;
      wheelIntervalId = null;
      let limit2 = 0;
      leftDirection ? limit2 = maxRotation : limit2 = 0;
        wheelIntervalId = setInterval(() => {
          rotations.wheelSideRotation = Math.min(rotations.wheelSideRotation + handling, limit2);
          if (rotations.wheelSideRotation >= limit2) clearInterval(wheelIntervalId);
        }, 20); 
      break;
    default:
      break;
  }
}
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
      
      return () => {
        window.removeEventListener('resize', resizeRenderer);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
      };
      
  }, []);

  return (
    <div className={styles.container}>
      <canvas className={styles.canvas} ref={canvasRef} />
    </div>
  );
}
