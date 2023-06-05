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
        { name: 'honk', keys: ['KeyH'] },
        { name: 'camera', keys: ['KeyC'] },
        { name: 'reset', keys: ['KeyR'] },
        { name: 'pause', keys: ['KeyP', 'Escape'] },
        { name: 'mute', keys: ['KeyM'] },
        { name: 'info', keys: ['KeyI'] },
      ]}
    >
      {children}
    </KeyboardControls>
  );
};

export default UserControls;
