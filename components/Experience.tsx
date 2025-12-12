import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { TreeParticles } from './TreeParticles';
import { TreeMorphState } from '../types';
import { COLORS } from '../constants';

interface ExperienceProps {
  state: TreeMorphState;
}

export const Experience: React.FC<ExperienceProps> = ({ state }) => {
  return (
    <div className="w-full h-screen">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 45 }}
        gl={{ antialias: false, toneMappingExposure: 1.5 }} // Disable default AA for PostProcessing perfs
        dpr={[1, 2]}
      >
        <color attach="background" args={[COLORS.BLACK_VOID]} />
        
        {/* --- LIGHTING --- */}
        <ambientLight intensity={0.5} color={COLORS.EMERALD_DEEP} />
        <spotLight 
          position={[10, 20, 10]} 
          angle={0.3} 
          penumbra={1} 
          intensity={200} 
          color={COLORS.GOLD_HIGHLIGHT} 
          castShadow 
        />
        <pointLight position={[-10, -10, -10]} intensity={50} color={COLORS.GOLD_ROSE} />

        {/* --- ENVIRONMENT --- */}
        {/* City preset gives great reflections for the gold ornaments */}
        <Environment preset="city" environmentIntensity={0.5} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* --- DYNAMIC CONTENT --- */}
        <group position={[0, -2, 0]}> {/* Offset to center visually */}
          <TreeParticles state={state} />
        </group>

        {/* --- EFFECTS --- */}
        {state === TreeMorphState.TREE_SHAPE && (
           <Sparkles 
             count={100} 
             scale={10} 
             size={4} 
             speed={0.4} 
             opacity={0.5} 
             color={COLORS.GOLD_HIGHLIGHT} 
           />
        )}

        {/* --- POST PROCESSING --- */}
        <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={0.8} // Only very bright things glow
            mipmapBlur 
            intensity={1.5} // High glow for luxury feel
            radius={0.6}
          />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
          <Noise opacity={0.02} /> 
        </EffectComposer>

        <OrbitControls 
          enablePan={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.5}
          minDistance={10}
          maxDistance={40}
          autoRotate={state === TreeMorphState.TREE_SHAPE}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};
