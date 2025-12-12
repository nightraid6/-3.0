import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ParticleData, TreeMorphState } from '../types';
import { CONFIG, COLORS } from '../constants';

interface TreeParticlesProps {
  state: TreeMorphState;
}

const tempObject = new THREE.Object3D();
const tempVec3 = new THREE.Vector3();

export const TreeParticles: React.FC<TreeParticlesProps> = ({ state }) => {
  const needleMeshRef = useRef<THREE.InstancedMesh>(null);
  const ornamentMeshRef = useRef<THREE.InstancedMesh>(null);

  // 1. Generate Data: Dual Coordinate System
  const { needles, ornaments } = useMemo(() => {
    const generateParticles = (count: number, isOrnament: boolean): ParticleData[] => {
      return Array.from({ length: count }).map((_, i) => {
        // --- SCATTER POSITION (Random Sphere) ---
        // Use spherical coordinates for better distribution
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const r = CONFIG.SCATTER_RADIUS * Math.cbrt(Math.random()); // Cubic root for uniform sphere volume
        
        const scatterX = r * Math.sin(phi) * Math.cos(theta);
        const scatterY = r * Math.sin(phi) * Math.sin(theta);
        const scatterZ = r * Math.cos(phi);

        // --- TREE POSITION (Cone) ---
        // Normalized height (0 bottom, 1 top)
        const hNorm = Math.random(); 
        const yTree = (hNorm - 0.5) * CONFIG.TREE_HEIGHT; // Centered vertically
        
        // Cone radius at this height (linear taper)
        const radiusAtY = CONFIG.TREE_RADIUS * (1 - hNorm);
        
        // Spiral angle for elegant distribution
        const spiralLoops = 15;
        const angleTree = hNorm * Math.PI * 2 * spiralLoops + (Math.random() * Math.PI / 2); // Add randomness to avoid perfect lines
        
        // Push ornaments slightly further out so they aren't buried
        const radiusOffset = isOrnament ? 0.2 : (Math.random() - 0.5) * 1.5;
        const finalR = Math.max(0, radiusAtY + radiusOffset);

        const treeX = finalR * Math.cos(angleTree);
        const treeZ = finalR * Math.sin(angleTree);

        return {
          id: i,
          scatterPos: [scatterX, scatterY, scatterZ],
          treePos: [treeX, yTree, treeZ],
          rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
          scale: isOrnament ? Math.random() * 0.4 + 0.2 : Math.random() * 0.5 + 0.5,
          floatSpeed: Math.random() * 0.5 + 0.2,
          phase: Math.random() * Math.PI * 2
        };
      });
    };

    return {
      needles: generateParticles(CONFIG.NEEDLE_COUNT, false),
      ornaments: generateParticles(CONFIG.ORNAMENT_COUNT, true)
    };
  }, []);

  // 2. Animation Loop
  useFrame((stateThree, delta) => {
    const time = stateThree.clock.elapsedTime;
    const isTree = state === TreeMorphState.TREE_SHAPE;

    // Helper to update a mesh layer
    const updateLayer = (
      meshRef: React.RefObject<THREE.InstancedMesh>, 
      data: ParticleData[], 
      colorHex: string
    ) => {
      if (!meshRef.current) return;

      const targetFactor = isTree ? 1 : 0;
      // We use a persistent ref for the current factor to enable smooth dampening
      // Storing it on the mesh userData is a hacky but efficient way to keep state without re-renders
      if (meshRef.current.userData.factor === undefined) meshRef.current.userData.factor = 0;
      
      // Smoothly interpolate the factor (0 -> 1 or 1 -> 0)
      meshRef.current.userData.factor = THREE.MathUtils.damp(
        meshRef.current.userData.factor,
        targetFactor,
        CONFIG.ANIMATION_SPEED,
        delta
      );

      const currentFactor = meshRef.current.userData.factor;

      data.forEach((particle, i) => {
        // Interpolate Position
        const [sx, sy, sz] = particle.scatterPos;
        const [tx, ty, tz] = particle.treePos;

        // Add "Breathing" movement in scatter mode
        const floatY = Math.sin(time * particle.floatSpeed + particle.phase) * 0.5;
        
        // If forming tree, reduce noise
        const noiseInfluence = 1 - currentFactor;
        
        const x = THREE.MathUtils.lerp(sx, tx, currentFactor);
        const y = THREE.MathUtils.lerp(sy + floatY, ty, currentFactor);
        const z = THREE.MathUtils.lerp(sz, tz, currentFactor);
        
        // Spin the entire group slowly in tree mode
        // Note: For better performance, we usually rotate the container, 
        // but calculating per instance allows for complex morphing effects.
        // Let's rotate the calculated position around Y axis if it's in tree mode
        const rotationSpeed = 0.2;
        const treeRotation = time * rotationSpeed * currentFactor; // Only rotate when forming tree
        
        const finalX = x * Math.cos(treeRotation) - z * Math.sin(treeRotation);
        const finalZ = x * Math.sin(treeRotation) + z * Math.cos(treeRotation);

        tempObject.position.set(finalX + (Math.random() * 0.05 * noiseInfluence), y, finalZ + (Math.random() * 0.05 * noiseInfluence));
        
        // Interpolate Rotation
        // In scatter: random rotation. In tree: point roughly upwards/outwards
        tempObject.rotation.set(
          particle.rotation[0] + time * 0.1 * noiseInfluence, 
          particle.rotation[1] + time * 0.1, 
          particle.rotation[2]
        );

        // Scale pop effect during transition
        const scalePop = 1 + Math.sin(currentFactor * Math.PI) * 0.5; 
        const s = particle.scale * scalePop;
        tempObject.scale.set(s, s, s);

        tempObject.updateMatrix();
        meshRef.current!.setMatrixAt(i, tempObject.matrix);
      });

      meshRef.current.instanceMatrix.needsUpdate = true;
    };

    updateLayer(needleMeshRef, needles, COLORS.EMERALD_LIGHT);
    updateLayer(ornamentMeshRef, ornaments, COLORS.GOLD_METALLIC);
  });

  return (
    <group>
      {/* Needles Layer */}
      <instancedMesh ref={needleMeshRef} args={[undefined, undefined, CONFIG.NEEDLE_COUNT]}>
        {/* Simple Tetrahedron or Cone for needles is efficient */}
        <coneGeometry args={[0.08, 0.4, 3]} /> 
        <meshStandardMaterial 
          color={COLORS.EMERALD_LIGHT} 
          roughness={0.6}
          metalness={0.1}
          emissive={COLORS.EMERALD_DEEP}
          emissiveIntensity={0.2}
        />
      </instancedMesh>

      {/* Ornaments Layer */}
      <instancedMesh ref={ornamentMeshRef} args={[undefined, undefined, CONFIG.ORNAMENT_COUNT]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial 
          color={COLORS.GOLD_METALLIC} 
          roughness={0.05} // Very shiny
          metalness={1} 
          emissive={COLORS.GOLD_HIGHLIGHT}
          emissiveIntensity={0.3}
        />
      </instancedMesh>
    </group>
  );
};
