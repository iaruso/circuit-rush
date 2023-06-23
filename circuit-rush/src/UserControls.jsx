import React from 'react';
import { KeyboardControls } from '@react-three/drei';

const UserControls = ({ children }) => {
  return (
    <KeyboardControls
      map={[
        { name: 'forward', keys: ['ArrowUp', 'KeyW', 'KeyZ'] },
        { name: 'backward', keys: ['ArrowDown', 'KeyS', 'KeyQ'] },
        { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
        { name: 'brake', keys: ['Space'] },
        { name: 'changeCamera', keys: ['KeyC'] },
        { name: 'reset', keys: ['KeyR'] },
      ]}
    >
      {children}
    </KeyboardControls>
  );
};

export default UserControls;
