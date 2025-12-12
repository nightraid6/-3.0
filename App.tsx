import React, { useState } from 'react';
import { Experience } from './components/Experience';
import { UIOverlay } from './components/UIOverlay';
import { TreeMorphState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeMorphState>(TreeMorphState.SCATTERED);

  const toggleState = () => {
    setTreeState(prev => 
      prev === TreeMorphState.SCATTERED 
        ? TreeMorphState.TREE_SHAPE 
        : TreeMorphState.SCATTERED
    );
  };

  return (
    <div className="relative w-full h-screen bg-[#010804] text-white overflow-hidden selection:bg-[#FFD700] selection:text-black">
      {/* 3D Scene Background */}
      <Experience state={treeState} />
      
      {/* UI Overlay */}
      <UIOverlay currentState={treeState} onToggle={toggleState} />
      
      {/* Audio Element (Optional ambiance) - Muted by default for browser policy */}
      {/* <audio loop ref={audioRef} src="/ambient-holiday.mp3" /> */}
    </div>
  );
};

export default App;
