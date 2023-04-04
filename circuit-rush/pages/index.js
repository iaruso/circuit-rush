import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';
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
    const physicsWorld = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0)
    });
    scene.background = new THREE.Color(0xffffff); // white background
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ canvas });
    
    /*const planeGeometry = new THREE.PlaneGeometry(20, 50);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(0, 0, 0);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);*/
    const groundBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane()
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    physicsWorld.addBody(groundBody);


    const boxBody = new CANNON.Body({
      mass: 10,
      position: new CANNON.Vec3(0, 2, 0),
      // shape: new CANNON.Box(new CANNON.Vec3(1, 0.3, 2.2))
      shape: new CANNON.Box(new CANNON.Vec3(1, 0.2, 2.2))
    });
    const vehicle = new CANNON.RigidVehicle({
      chassisBody: boxBody
    });

    const mass = 2;
    const wheelShape = new CANNON.Sphere(0.3);
    const quaternion = new CANNON.Quaternion().setFromEuler(0, 0, -Math.PI / 2)
    const wheelMaterial = new CANNON.Material('wheel');
    const down = new CANNON.Vec3(0, 0, 0);
    
    const wheelBodies = [];
    
    for (let i = 0; i < 4; i++) {
      const wheelBody = new CANNON.Body({ mass, material: wheelMaterial });
      wheelBody.addShape(wheelShape, new CANNON.Vec3(), quaternion);
      wheelBody.angularDamping = 0.9;
      wheelBodies.push(wheelBody);
      vehicle.addWheel({
        body: wheelBody,
        position: new CANNON.Vec3((i % 2 === 0 ? -0.85 : 0.85), -0.2, (i < 2 ? 1.3 : -2)),
        axis: new CANNON.Vec3(1, 0, 0),
        direction: down
      });
    }
    
    
    vehicle.addToWorld(physicsWorld);

    const downforce = 0.1;
    function applyDownforce(vehicle) {
      // Get the vehicle's current speed
      const speed = vehicle.chassisBody.velocity.length();
    
      // Calculate the downforce based on the speed
      const force = speed * downforce;
    
      // Apply the downforce to the chassis
      vehicle.chassisBody.applyForce(new CANNON.Vec3(0, -force, 0), new CANNON.Vec3(0, 0, 0));
    }



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

      let carBody;
      let frontRightWheel;
      let frontLeftWheel;
      let rearWheels;



      loader.load('/assets/models/car.gltf', (gltf) => {
        const car = gltf.scene;
        car.scale.set(0.25, 0.25, 0.25);
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
        carBody = car;
        carBody.add(axisHelper);
        scene.add(car);
        animateCar();
      });


      const cannonDebugger = new CannonDebugger(scene, physicsWorld, {
        color: 0xff0000
      });

      function animate() {
        physicsWorld.fixedStep();
        cannonDebugger.update();
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        controls.update();
      }
      animate();
      
      function animateCar(){
        const offset = new THREE.Vector3(0, 2, 5); // adjust the values as needed
        const rotation = new THREE.Euler(0, Math.PI, 0); // adjust the values as needed
        const relativeCameraOffset = offset.applyEuler(rotation);
        const cameraPosition = carBody.position.clone().add(relativeCameraOffset);
        camera.position.copy(cameraPosition);
        camera.lookAt(carBody.position);
        

        applyDownforce(vehicle);

        physicsWorld.fixedStep();
        cannonDebugger.update();
        carBody.position.copy(boxBody.position);
        carBody.quaternion.copy(boxBody.quaternion);
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
  const maxSteerVal = Math.PI / 8;
  const maxForce = 10;

  switch (event.keyCode) {
    case 37:
      clearInterval(wheelIntervalId);
      wheelIntervalId = null;
      leftDirection = true;
      wheelIntervalId = setInterval(() => {
        rotations.wheelSideRotation = Math.min(rotations.wheelSideRotation + handling, maxRotation);
        if (rotations.wheelSideRotation === maxRotation) clearInterval(wheelIntervalId);
      }, 20);
      vehicle.setSteeringValue(maxSteerVal, 0);
          vehicle.setSteeringValue(maxSteerVal, 1);
      break;
    case 38:
      vehicle.setWheelForce(maxForce, 0);
      vehicle.setWheelForce(maxForce, 1);
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
      vehicle.setSteeringValue(-maxSteerVal, 0);
          vehicle.setSteeringValue(-maxSteerVal, 1);
      break;
    case 40:
      vehicle.setWheelForce(0, 0);
      vehicle.setWheelForce(0, 1);
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
        vehicle.setSteeringValue(0, 0);
          vehicle.setSteeringValue(0, 1);
      break;
    case 38:
      vehicle.setWheelForce(0, 1);
      vehicle.setWheelForce(0, 1);
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
        vehicle.setSteeringValue(0, 0);
          vehicle.setSteeringValue(0, 1);
      break;
    case 40:
      vehicle.setWheelForce(0, 0);
      vehicle.setWheelForce(0, 1);
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
