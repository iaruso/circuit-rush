import React from 'react';
import { KeyboardControls } from '@react-three/drei';

const UserControls = ({ children }) => {
  return (
    <KeyboardControls
      map={[
        { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
        { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
        { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
        { name: 'brake', keys: ['Space'] },
        { name: 'horn', keys: ['KeyH'] },
        { name: 'changeCamera', keys: ['KeyC'] },
        { name: 'reset', keys: ['KeyR'] },
        { name: 'pause', keys: ['KeyP'] },
        { name: 'mute', keys: ['KeyM'] },
				{ name: 'quit', keys: ['Escape'] }
      ]}
    >
      {children}
    </KeyboardControls>
  );
};

export default UserControls;
