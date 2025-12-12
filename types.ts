export enum TreeMorphState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface ParticleData {
  id: number;
  // Position in the chaotic state
  scatterPos: [number, number, number];
  // Position in the tree form
  treePos: [number, number, number];
  // Rotation for randomness
  rotation: [number, number, number];
  // Scale variation
  scale: number;
  // Speed of floating in scattered mode
  floatSpeed: number;
  // Random phase for sine wave animation
  phase: number;
}
