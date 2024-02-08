import { Html } from '@react-three/drei';


export default function GameOptions() {
  return (
    <Html wrapperClass={'buttons-overlay'} className='game-buttons'>
      <a id='source-code-btn' className="source-info-btn" href='https://github.com/iaruso/circuit-rush' target='_blank'>
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M320-240 80-480l240-240 57 57-184 184 183 183-56 56Zm320 0-57-57 184-184-183-183 56-56 240 240-240 240Z"/></svg>
      </a>
    </Html>
  )
};

