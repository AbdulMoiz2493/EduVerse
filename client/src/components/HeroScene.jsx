
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, useTexture, Float, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

function FloatingBook(props) {
  const { position, rotation } = props;
  const mesh = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.position.y = position[1] + Math.sin(t) * 0.1;
    mesh.current.rotation.z = rotation[2] + Math.sin(t * 0.5) * 0.05;
  });

  return (
    <mesh ref={mesh} position={position} rotation={rotation}>
      <boxGeometry args={[1, 1.4, 0.15]} />
      <meshStandardMaterial color="#4f46e5" />
      <mesh position={[0, 0, 0.08]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.9, 1.3, 0.01]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </mesh>
  );
}

function Particles({ count = 300 }) {
  const mesh = useRef();
  const { viewport } = useThree();
  
  useEffect(() => {
    if (!mesh.current) return;
    
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      scales[i] = Math.random() * 0.2 + 0.05;
    }
    
    mesh.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    mesh.current.geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
  }, [count]);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime() * 0.1;
    mesh.current.rotation.x = Math.sin(time / 4);
    mesh.current.rotation.y = Math.sin(time / 2);
  });
  
  return (
    <points ref={mesh}>
      <bufferGeometry />
      <pointsMaterial size={0.05} color="#6366f1" sizeAttenuation transparent />
    </points>
  );
}

function GradientBackground() {
  const mesh = useRef();
  
  useFrame(() => {
    mesh.current.rotation.z += 0.001;
  });
  
  return (
    <mesh ref={mesh} scale={10} position={[0, 0, -5]}>
      <planeGeometry />
      <meshBasicMaterial color={new THREE.Color('#f0f4ff')} />
    </mesh>
  );
}

function HeroTitle() {
  const textRef = useRef();
  
  useEffect(() => {
    if (!textRef.current) return;
    
    gsap.fromTo(
      textRef.current.position, 
      { y: -2 }, 
      { y: 0, duration: 1.5, ease: "elastic.out(1, 0.5)" }
    );
  }, []);
  
  return (
    <group ref={textRef}>
      <Center position={[0, 0, 0]}>
        <Text3D
          font="/fonts/Inter_Bold.json"
          size={0.7}
          height={0.1}
          bevelEnabled
          bevelSize={0.01}
          bevelThickness={0.01}
          bevelSegments={5}
        >
          EduVerse
          <meshStandardMaterial color="#4f46e5" />
        </Text3D>
      </Center>
    </group>
  );
}

export function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <GradientBackground />
      <Particles />
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <HeroTitle />
      </Float>
      <FloatingBook position={[-2, 0, 1]} rotation={[0, 0.5, -0.2]} />
      <FloatingBook position={[2, -0.5, 0]} rotation={[0.3, -0.5, 0.1]} />
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.5} 
        minPolarAngle={Math.PI / 2.5} 
        maxPolarAngle={Math.PI / 2.5}
      />
    </>
  );
}

export function HeroScene() {
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }}>
      <Scene />
    </Canvas>
  );
}

export default HeroScene;
