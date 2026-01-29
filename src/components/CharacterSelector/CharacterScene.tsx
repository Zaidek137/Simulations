import { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Center, Grid } from '@react-three/drei';
import * as THREE from 'three';
import type { IndexEntry } from '@/data/characterData';
import { FACTION_COLORS } from '@/data/characterData';

interface CharacterSceneProps {
  character: IndexEntry;
  className?: string;
}

// Placeholder model when no GLB is available
function PlaceholderModel({ character }: { character: IndexEntry }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  
  // Get colors from faction
  const factionColors = FACTION_COLORS[character.faction] || FACTION_COLORS['Unknown'];
  const primaryColor = useMemo(() => 
    new THREE.Color(factionColors.primary), [factionColors.primary]);
  const secondaryColor = useMemo(() => 
    new THREE.Color(factionColors.secondary), [factionColors.secondary]);

  // Animate the placeholder
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.3;
    }
    
    if (coreRef.current) {
      coreRef.current.position.y = Math.sin(t * 2) * 0.1;
      coreRef.current.rotation.x = t * 0.5;
      coreRef.current.rotation.z = t * 0.3;
    }
    
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.8;
      ring1Ref.current.rotation.y = t * 0.4;
    }
    
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -t * 0.6;
      ring2Ref.current.rotation.z = t * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central core - octahedron */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Inner ring */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1, 0.04, 16, 32]} />
        <meshStandardMaterial
          color={secondaryColor}
          emissive={secondaryColor}
          emissiveIntensity={0.2}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      
      {/* Outer ring */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.4, 0.02, 16, 32]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Wireframe sphere for hologram effect */}
      <mesh>
        <icosahedronGeometry args={[1.8, 1]} />
        <meshBasicMaterial
          color={primaryColor}
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>
      
      {/* Base platform */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.2, 6]} />
        <meshStandardMaterial
          color="#e8ecf4"
          emissive={primaryColor}
          emissiveIntensity={0.1}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

// GLB Model loader component
function GLBModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (modelRef.current) {
      // Subtle floating animation
      modelRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05;
    }
  });

  return (
    <group ref={modelRef}>
      <Center>
        <primitive object={scene.clone()} scale={1.5} />
      </Center>
    </group>
  );
}

// Loading fallback
function LoadingFallback() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime();
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#00F5FF" wireframe />
    </mesh>
  );
}

// Main scene content
function SceneContent({ character }: { character: IndexEntry }) {
  return (
    <>
      {/* Grid floor for futuristic effect */}
      <Grid
        position={[0, -1.5, 0]}
        args={[10, 10]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#00F5FF"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#0088ff"
        fadeDistance={8}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />

      {/* Environment and lighting via Stage */}
      <Stage
        environment="city"
        intensity={0.4}
        shadows={{ type: 'contact', opacity: 0.3, blur: 2 }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {character.modelUrl ? (
            <GLBModel url={character.modelUrl} />
          ) : (
            <PlaceholderModel character={character} />
          )}
        </Suspense>
      </Stage>
      
      {/* Additional ambient lighting */}
      <ambientLight intensity={0.6} />
      
      {/* Colored accent lights */}
      <pointLight 
        position={[5, 5, 5]} 
        color="#00F5FF" 
        intensity={0.3} 
      />
      <pointLight 
        position={[-5, 3, -5]} 
        color="#FF0055" 
        intensity={0.2} 
      />
    </>
  );
}

export function CharacterScene({ character, className }: CharacterSceneProps) {
  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{ 
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      }}
    >
      {/* Light background color */}
      <color attach="background" args={['#f0f4f8']} />
      
      {/* Scene content */}
      <SceneContent character={character} />
      
      {/* Orbit controls for rotation */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={10}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}

export default CharacterScene;
