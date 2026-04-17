"use client";

import * as THREE from 'three';
import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, ContactShadows } from '@react-three/drei';

function Robot({ isPasswordFocused, mouseX, mouseY }: { isPasswordFocused: boolean, mouseX: number, mouseY: number }) {
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftHandRef = useRef<THREE.Mesh>(null);
  const rightHandRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (!headRef.current || !leftEyeRef.current || !rightEyeRef.current || !leftHandRef.current || !rightHandRef.current) return;
    
    // Target state variables
    let targetRotationX = 0;
    let targetRotationY = 0;
    let targetEyeScaleY = 1;
    let targetHandY = -1.5; // Hands down by default
    let targetHandZ = 0;
    let targetHandRotX = 0;
    
    if (isPasswordFocused) {
      // Look down, close eyes, bring hands up to cover face
      targetRotationX = 0.4;
      targetRotationY = 0;
      targetEyeScaleY = 0.1; // Squint/Close
      
      // Hands move up to cover face
      targetHandY = -0.1;
      targetHandZ = 1.2;
      targetHandRotX = -0.5;
    } else {
      // Track mouse position smoothly
      targetRotationX = (mouseY * Math.PI) / 6;
      targetRotationY = (mouseX * Math.PI) / 4;
      targetEyeScaleY = 1; // Open
      
      // Hands rest down
      targetHandY = -1.5;
      targetHandZ = 0.5;
      targetHandRotX = 0;
    }
    
    // Smooth interpolation (lerp)
    headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetRotationX, 0.1);
    headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetRotationY, 0.1);
    
    const currentScale = leftEyeRef.current.scale.y;
    const newScale = THREE.MathUtils.lerp(currentScale, targetEyeScaleY, 0.2);
    leftEyeRef.current.scale.y = newScale;
    rightEyeRef.current.scale.y = newScale;

    leftHandRef.current.position.y = THREE.MathUtils.lerp(leftHandRef.current.position.y, targetHandY, 0.1);
    leftHandRef.current.position.z = THREE.MathUtils.lerp(leftHandRef.current.position.z, targetHandZ, 0.1);
    leftHandRef.current.rotation.x = THREE.MathUtils.lerp(leftHandRef.current.rotation.x, targetHandRotX, 0.1);

    rightHandRef.current.position.y = THREE.MathUtils.lerp(rightHandRef.current.position.y, targetHandY, 0.1);
    rightHandRef.current.position.z = THREE.MathUtils.lerp(rightHandRef.current.position.z, targetHandZ, 0.1);
    rightHandRef.current.rotation.x = THREE.MathUtils.lerp(rightHandRef.current.rotation.x, targetHandRotX, 0.1);
  });

  return (
    <group>
      {/* Head Group (Tracks mouse) */}
      <group ref={headRef}>
        {/* Main Head Shape */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.2, 1.8, 2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.1} metalness={0.2} />
        </mesh>
        
        {/* Face Screen */}
        <mesh position={[0, 0, 1.01]}>
          <planeGeometry args={[1.8, 1.2]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>

        {/* Left Eye */}
        <mesh ref={leftEyeRef} position={[-0.4, 0, 1.02]}>
          <capsuleGeometry args={[0.15, 0.3, 4, 8]} />
          <meshBasicMaterial color="#38bdf8" />
          {/* Eye Glow */}
          <pointLight color="#38bdf8" intensity={0.5} distance={2} />
        </mesh>
        
        {/* Right Eye */}
        <mesh ref={rightEyeRef} position={[0.4, 0, 1.02]}>
          <capsuleGeometry args={[0.15, 0.3, 4, 8]} />
          <meshBasicMaterial color="#38bdf8" />
          <pointLight color="#38bdf8" intensity={0.5} distance={2} />
        </mesh>
        
        {/* Antenna Base */}
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.1, 0.2, 0.2]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>
        {/* Antenna Stem */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.5]} />
          <meshStandardMaterial color="#94a3b8" metalness={1} />
        </mesh>
        {/* Antenna Bulb */}
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.12]} />
          <meshStandardMaterial color="#ef4444" roughness={0.2} emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>
        
        {/* Headphones / Ears */}
        <mesh position={[-1.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.4, 0.4, 0.2]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.4} />
        </mesh>
        <mesh position={[1.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.4, 0.4, 0.2]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.4} />
        </mesh>
      </group>

      {/* Hands (Separate from head so they can move up independently) */}
      <mesh ref={leftHandRef} position={[-0.8, -1.5, 0.5]} castShadow>
        <capsuleGeometry args={[0.3, 0.6, 4, 8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.1} />
      </mesh>
      <mesh ref={rightHandRef} position={[0.8, -1.5, 0.5]} castShadow>
        <capsuleGeometry args={[0.3, 0.6, 4, 8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.1} />
      </mesh>
    </group>
  );
}

export function CuteRobot({ isPasswordFocused }: { isPasswordFocused: boolean }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates (-1 to +1)
      setMouse({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };
    
    // Fallback mouse tracking if cursor leaves window
    const handleMouseLeave = () => setMouse({ x: 0, y: 0 });

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="h-64 w-full relative z-10 mx-auto">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#3b82f6" />
        
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
          <Robot isPasswordFocused={isPasswordFocused} mouseX={mouse.x} mouseY={mouse.y} />
        </Float>
        
        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
