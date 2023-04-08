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
  const [speedValue, setSpeedValue] = useState(0); // Declare a state variable
  const [gearValue, setGearValue] = useState(0); // Declare a state variable
  const [directionValue, setDirectionValue] = useState(0);
  useEffect(() => {

    const textureLoader = new THREE.TextureLoader();
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.y = 5;
    const renderer = new THREE.WebGLRenderer({ canvas });
    
    var geometry = new THREE.PlaneGeometry(100, 100, 100);
    var material = new THREE.MeshBasicMaterial({color: 0x20feef, side: THREE.DoubleSide});
    var plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = Math.PI/2;
    scene.add(plane);
    
    var sunlight = new THREE.DirectionalLight(0xffffff, 1.0);
    sunlight.position.set(-10, 10, 0);
    scene.add(sunlight)
    
    /**
    * Physics
    **/
    const physicsWorld = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0)
    });
    physicsWorld.broadphase = new CANNON.SAPBroadphase(physicsWorld)
    
    var groundMaterial = new CANNON.Material('groundMaterial');
    var wheelMaterial = new CANNON.Material('wheelMaterial');
    var wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
        friction: 0.2,
        restitution: 0,
        contactEquationStiffness: 1000,
    });
    
    physicsWorld.addContactMaterial(wheelGroundContactMaterial);
    
    // car physics body
    var chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.3, 2));
    var chassisBody = new CANNON.Body({mass: 400});
    chassisBody.addShape(chassisShape);
    chassisBody.position.set(0, 2, 0);
    chassisBody.angularVelocity.set(0, 0, 0); // initial velocity
    
    // parent vehicle object
    var vehicle = new CANNON.RaycastVehicle({
      chassisBody: chassisBody,
      indexRightAxis: 0, // x
      indexUpAxis: 1, // y
      indexForwardAxis: 2, // z
    });
    
    // wheel options
    var options = {
      radius: 0.35,
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
    
    var axlewidth = 0.8;
    var wheelY = 0.18;
    options.chassisConnectionPointLocal.set(axlewidth, wheelY, -2);
    vehicle.addWheel(options);
    
    options.chassisConnectionPointLocal.set(-axlewidth, wheelY, -2);
    vehicle.addWheel(options);
    
    options.chassisConnectionPointLocal.set(axlewidth, wheelY, 1.25);
    vehicle.addWheel(options);
    
    options.chassisConnectionPointLocal.set(-axlewidth, wheelY, 1.25);
    vehicle.addWheel(options);
    
    vehicle.addToWorld(physicsWorld);
    
    // car wheels
    var wheelBodies = [];
    vehicle.wheelInfos.forEach(function(wheel) {
      var shape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 12);
      var body = new CANNON.Body({mass: 100, material: wheelMaterial});
      var q = new CANNON.Quaternion();
      q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
      body.addShape(shape, new CANNON.Vec3(), q);
      wheelBodies.push(body);

    });
    
    // update the wheels to match the physics
    physicsWorld.addEventListener('postStep', function() {
      for (var i=0; i<vehicle.wheelInfos.length; i++) {
        vehicle.updateWheelTransform(i);
        var t = vehicle.wheelInfos[i].worldTransform;
        // update wheel physics
        wheelBodies[i].position.copy(t.position);
        wheelBodies[i].quaternion.copy(t.quaternion);

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
test3.position.set(0, 15, -45);

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
      let rearRightWheel;
      let rearLeftWheel;
      loader.load('/assets/models/car.gltf', (gltf) => {
        const car = gltf.scene;
        car.scale.set(0.25, 0.25, 0.25);
        const matcapTexture = textureLoader.load('/assets/textures/matcaps/7.png')


        const carMaterial = new THREE.MeshMatcapMaterial();
        carMaterial.matcap = matcapTexture;
        car.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.material = carMaterial;
          }
          console.log(obj)
          if (obj.name== 'Body'){
            obj.material = carMaterial;
          }
        });
        const axisHelper = new THREE.AxesHelper(10)
        frontRightWheel = car.getObjectByName('Front_Right_Wheel');
        frontRightWheel.add(axisHelper);
        frontRightWheel.rotation.order = 'YXZ';
        frontLeftWheel = car.getObjectByName('Front_Left_Wheel');
        frontLeftWheel.rotation.order = 'YXZ';
        rearRightWheel = car.getObjectByName('Rear_Right_Wheel');
        rearRightWheel.rotation.order = 'YXZ';
        rearLeftWheel = car.getObjectByName('Rear_Left_Wheel');
        rearLeftWheel.rotation.order = 'YXZ';
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
      var wheelInfo1 = vehicle.wheelInfos[0]; //RL
      var wheelInfo2 = vehicle.wheelInfos[1]; //RR
      var wheelInfo3 = vehicle.wheelInfos[2]; //FL
      var wheelInfo4 = vehicle.wheelInfos[3]; //FR
      var speed;
      var dotProduct;

      function animateCar(){
        var velocity = chassisBody.velocity;
        speed = Math.round(velocity.length() * 3.6);
          setSpeedValue(speed);
          var direction = new CANNON.Vec3(0, 0, 1); // Assuming initial direction is along negative Z-axis
          vehicle.chassisBody.vectorToWorldFrame(direction, direction); // Update direction vector to world frame
          
          var velocity = vehicle.chassisBody.velocity; // Get the velocity of the vehicle
          
          dotProduct = velocity.dot(direction); // Calculate the dot product
          
          if (dotProduct > 0) {
            console.log('Vehicle is moving forward');
            setDirectionValue('F')
          } else if (dotProduct < 0) {
            console.log('Vehicle is moving backward');
            setDirectionValue('B')
          } else {
            console.log('Vehicle is not moving');
          }
          

          
      
        physicsWorld.fixedStep();
        cannonDebugger.update();
        carBody.position.copy(chassisBody.position);
        carBody.quaternion.copy(chassisBody.quaternion);

        rearLeftWheel.position.clone(wheelInfo1.chassisConnectionPointWorld);
        rearLeftWheel.rotation.set(-wheelInfo1.rotation, 0, 0);
        

rearRightWheel.position.clone(wheelInfo2.chassisConnectionPointWorld);
rearRightWheel.rotation.set(-wheelInfo2.rotation, 0, 0);

frontLeftWheel.position.clone(wheelInfo3.chassisConnectionPointWorld);
frontLeftWheel.rotation.set(-wheelInfo3.rotation, wheelInfo3.steering, 0);


frontRightWheel.position.clone(wheelInfo4.chassisConnectionPointWorld);
frontRightWheel.rotation.set(-wheelInfo4.rotation, wheelInfo4.steering, 0);


        test3.getWorldPosition(view);
        if(view.y < 1) view.y = 1;
        camera.position.lerpVectors(camera.position, view, 1);
        camera.lookAt(carBody.position);





requestAnimationFrame(animateCar);
        renderer.render(scene, camera);
        controls.update();
      }
      
      var currentGear = 1;
      setGearValue(currentGear);
      function navigate(e) {
        if (e.type !== 'keydown' && e.type !== 'keyup') return;
        var keyup = e.type === 'keyup';
        var maxSpeed = 200; // Maximum speed in units per second
        var currentSpeed = speed; // Current speed of the vehicle

        var engineForces = [2000, 4000, 6000, 10000, 10000, 0]; 
        var brakeForces = [500, 1000, 1500, 2000, 2000, 2000];
        var maxSpeeds = [50, 100, 150, 200, 250, 400];
      
        for (var i = 1; i < maxSpeeds.length; i++) {
          if (currentSpeed <= maxSpeeds[i-1]) {
            currentGear = i;
            break;
          }
        }
        setGearValue(currentGear);
      

      
        // Apply engine force and brake force to the vehicle
        
        vehicle.setBrake(0, 0);
        vehicle.setBrake(0, 1);
        vehicle.setBrake(0, 2);
        vehicle.setBrake(0, 3);

        var norm = 1 - Math.min((speed / 400), 0.5);
        
      
        // Set max steering value
        var maxSteerVal = (Math.PI / 10) * norm;
      
        // Update steering based on key input
        switch (e.keyCode) {
          case 38: // forward
              if (dotProduct >= 0){
                vehicle.applyEngineForce(keyup ? 0 : -engineForces[currentGear], 2);
                vehicle.applyEngineForce(keyup ? 0 : -engineForces[currentGear], 3);
              } else {
                vehicle.applyEngineForce(keyup ? 0 : -brakeForces[currentGear], 2);
                vehicle.applyEngineForce(keyup ? 0 : -brakeForces[currentGear], 3);
              }
            break;
      
          case 40: // backward
            if (dotProduct >= 0) {
              vehicle.applyEngineForce(keyup ? 0 : brakeForces[currentGear], 2);
              vehicle.applyEngineForce(keyup ? 0 : brakeForces[currentGear], 3);
            } else {
              vehicle.applyEngineForce(keyup ? 0 : engineForces[currentGear]/10, 2);
              vehicle.applyEngineForce(keyup ? 0 : engineForces[currentGear]/10, 3);
            }
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
      <p id="speed">{speedValue} + {gearValue} ({directionValue})</p>
    </div>
  );
}
