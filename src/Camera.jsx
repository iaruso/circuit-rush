import { PerspectiveCamera } from '@react-three/drei';
import { forwardRef } from 'react';

const Camera = forwardRef((props, ref) => {
  return <PerspectiveCamera makeDefault ref={ref} fov={props.performanceMode ? 25 : 30} {...props}/>
});

export default Camera;
