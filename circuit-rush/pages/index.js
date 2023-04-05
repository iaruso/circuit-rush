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
    physicsWorld.broadphase = new CANNON.SAPBroadphase(physicsWorld)


    
    


    scene.background = new THREE.Color(0xffffff);
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.y = 5;
    const renderer = new THREE.WebGLRenderer({ canvas });
    
    var geometry = new THREE.PlaneGeometry(10, 10, 10);
    var material = new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide});
    var plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = Math.PI/2;
    scene.add(plane);
    
    var sunlight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunlight.position.set(-10, 10, 0);
    scene.add(sunlight)
    
    /**
    * Physics
    **/
    
    var groundMaterial = new CANNON.Material('groundMaterial');
    var wheelMaterial = new CANNON.Material('wheelMaterial');
    var wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
        friction: 0.3,
        restitution: 0,
        contactEquationStiffness: 1000,
    });
    
    physicsWorld.addContactMaterial(wheelGroundContactMaterial);
    
    // car physics body
    var chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.3, 2));
    var chassisBody = new CANNON.Body({mass: 150});
    chassisBody.addShape(chassisShape);
    chassisBody.position.set(0, 2, 0);
    chassisBody.angularVelocity.set(0, 0, 0); // initial velocity
    
    // car visual body
    var geometry = new THREE.BoxGeometry(2, 0.6, 4); // double chasis shape
    var material = new THREE.MeshBasicMaterial({color: 0xffff00, side: THREE.DoubleSide});
    var box = new THREE.Mesh(geometry, material);
    scene.add(box);
    
    // parent vehicle object
    var vehicle = new CANNON.RaycastVehicle({
      chassisBody: chassisBody,
      indexRightAxis: 0, // x
      indexUpAxis: 1, // y
      indexForwardAxis: 2, // z
    });
    
    // wheel options
    var options = {
      radius: 0.3,
      directionLocal: new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 45,
      suspensionRestLength: 0.4,
      frictionSlip: 5,
      dampingRelaxation: 2.3,
      dampingCompression: 4.5,
      maxSuspensionForce: 200000,
      rollInfluence:  0.01,
      axleLocal: new CANNON.Vec3(-1, 0, 0),
      chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
      maxSuspensionTravel: 0.25,
      customSlidingRotationalSpeed: -30,
      useCustomSlidingRotationalSpeed: true,
    };
    
    var axlewidth = 0.7;
    options.chassisConnectionPointLocal.set(axlewidth, 0, -1);
    vehicle.addWheel(options);
    
    options.chassisConnectionPointLocal.set(-axlewidth, 0, -1);
    vehicle.addWheel(options);
    
    options.chassisConnectionPointLocal.set(axlewidth, 0, 1);
    vehicle.addWheel(options);
    
    options.chassisConnectionPointLocal.set(-axlewidth, 0, 1);
    vehicle.addWheel(options);
    
    vehicle.addToWorld(physicsWorld);
    
    // car wheels
    var wheelBodies = [],
        wheelVisuals = [];
    vehicle.wheelInfos.forEach(function(wheel) {
      var shape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);
      var body = new CANNON.Body({mass: 1, material: wheelMaterial});
      var q = new CANNON.Quaternion();
      q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
      body.addShape(shape, new CANNON.Vec3(), q);
      wheelBodies.push(body);
      // wheel visual body
      var geometry = new THREE.CylinderGeometry( wheel.radius, wheel.radius, 0.4, 32 );
      var material = new THREE.MeshPhongMaterial({
        color: 0xd0901d,
        emissive: 0xaa0000,
        side: THREE.DoubleSide,
        flatShading: true,
      });
      var cylinder = new THREE.Mesh(geometry, material);
      cylinder.geometry.rotateZ(Math.PI/2);
      wheelVisuals.push(cylinder);
      scene.add(cylinder);
    });
    
    // update the wheels to match the physics
    physicsWorld.addEventListener('postStep', function() {
      for (var i=0; i<vehicle.wheelInfos.length; i++) {
        vehicle.updateWheelTransform(i);
        var t = vehicle.wheelInfos[i].worldTransform;
        // update wheel physics
        wheelBodies[i].position.copy(t.position);
        wheelBodies[i].quaternion.copy(t.quaternion);
        // update wheel visuals
        wheelVisuals[i].position.copy(t.position);
        wheelVisuals[i].quaternion.copy(t.quaternion);
      }
  


    /*const boxBody = new CANNON.Body({
      mass: 10,
      position: new CANNON.Vec3(0, 3, 0),
      shape: new CANNON.Box(new CANNON.Vec3(1, 0.3, 2.2)),
   
    });
    const vehicle = new CANNON.RaycastVehicle({
      chassisBody: boxBody
    });*/

    
    /*const mass = 2;
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
    }*/
    
    
    //vehicle.addToWorld(physicsWorld);

});

const test2 = new THREE.Object3D();
test2.position.set(0, 0, 0);

const test3 = new THREE.Object3D();
test3.position.set(0, 8, -20);

test2.add(test3);

scene.add(test2);

var q = plane.quaternion;
var planeBody = new CANNON.Body({
  mass: 0, // mass = 0 makes the body static
  material: groundMaterial,
  shape: new CANNON.Plane(),
  quaternion: new CANNON.Quaternion(-q._x, q._y, q._z, q._w)
});
physicsWorld.addBody(planeBody)

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
        carBody.add(test2);
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
      let wDir = new THREE.Vector3(0, 0, -1);
      let position = new THREE.Vector3();
      let quaternion = new THREE.Quaternion();
      let view = new THREE.Vector3();
      function animateCar(){

        physicsWorld.fixedStep();
        cannonDebugger.update();
        carBody.position.copy(chassisBody.position);
        carBody.quaternion.copy(chassisBody.quaternion);
        /*position.copy(chassisBody.position);
        quaternion.copy(chassisBody.quaternion);
        wDir.applyQuaternion(quaternion);
        wDir.normalize();*/
        
        test3.getWorldPosition(view);
        if(view.y < 1) view.y = 1;
        camera.position.lerpVectors(camera.position, view, 1);
        camera.lookAt(carBody.position);
        console.log(camera.position.y)

/*let cameraPosition2 = position.clone().add(wDir.clone().add(new THREE.Vector3(0, 1.2, -5)));
wDir.add(new THREE.Vector3(0, 1, 0));
camera.position.copy(cameraPosition2);
camera.lookAt(position);*/




requestAnimationFrame(animateCar);
        renderer.render(scene, camera);
        controls.update();
      }
      
      let wheelIntervalId = null;
      let leftDirection = false;
      let rightDirection = false;
      const handling = 5;
      const maxRotation = 20;
      const minRotation = -20;

      function navigate(e) {
        if (e.type != 'keydown' && e.type != 'keyup') return;
        var keyup = e.type == 'keyup';
        vehicle.setBrake(0, 0);
        vehicle.setBrake(0, 1);
        vehicle.setBrake(0, 2);
        vehicle.setBrake(0, 3);
      
        var engineForce = 800,
            maxSteerVal = 0.3;
        switch(e.keyCode) {
      
          case 38: // forward
            vehicle.applyEngineForce(keyup ? 0 : -engineForce, 2);
            vehicle.applyEngineForce(keyup ? 0 : -engineForce, 3);
            break;
      
          case 40: // backward
            vehicle.applyEngineForce(keyup ? 0 : engineForce, 2);
            vehicle.applyEngineForce(keyup ? 0 : engineForce, 3);
            break;
      
          case 39: // right
            vehicle.setSteeringValue(keyup ? 0 : -maxSteerVal, 2);
            vehicle.setSteeringValue(keyup ? 0 : -maxSteerVal, 3);
            break;
      
          case 37: // left
            vehicle.setSteeringValue(keyup ? 0 : maxSteerVal, 2);
            vehicle.setSteeringValue(keyup ? 0 : maxSteerVal, 3);
            break;
        }
      }
      document.addEventListener('keydown', navigate);
      document.addEventListener('keyup', navigate);
      
      return () => {
        window.removeEventListener('resize', resizeRenderer);
        document.removeEventListener('keydown', navigate);
        document.removeEventListener('keyup', navigate);
      };
      
  }, []);

  return (
    <div className={styles.container}>
      <canvas className={styles.canvas} ref={canvasRef} />
    </div>
  );
}
