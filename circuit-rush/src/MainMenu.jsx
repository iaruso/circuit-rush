import React, { useState } from 'react';

const MainMenu = ({ startGame }) => {
  const [soundButton, setSoundActive] = useState(true);
  const [musicButton, setMusicActive] = useState(true);

  const handlePlayClick = () => {
    startGame();
  };

  const soundToggle = () => {
    setSoundActive(!soundButton);
  };

  const musicToggle = () => {
    setMusicActive(!musicButton);
  };

  return (
    <div>
      <div className="background-image"></div>
      <div className="menu">
        <button className='play-button' onClick={ handlePlayClick }>Play</button>
        <button className='settings-button'>Settings</button>
        <div className="audio-options">
          <button className='sound-button' onClick={ soundToggle }>
						{soundButton ? (
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320Z"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M792-56 671-177q-25 16-53 27.5T560-131v-82q14-5 27.5-10t25.5-12L480-368v208L280-360H120v-240h128L56-792l56-56 736 736-56 56Zm-8-232-58-58q17-31 25.5-65t8.5-70q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 53-14.5 102T784-288ZM650-422l-90-90v-130q47 22 73.5 66t26.5 96q0 15-2.5 29.5T650-422ZM480-592 376-696l104-104v208Z"/></svg>
            )}
					</button>
          <button className='music-button' onClick={ musicToggle }>
						{musicButton ? (
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-422h240v160H560v400q0 66-47 113t-113 47Z"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M792-56 56-792l56-56 736 736-56 56ZM560-514l-80-80v-246h240v160H560v166ZM400-120q-66 0-113-47t-47-113q0-66 47-113t113-47q23 0 42.5 5.5T480-418v-62l80 80v120q0 66-47 113t-113 47Z"/></svg>
            )}
					</button>
        </div>
      </div>
      {/* Add settings */}
    </div>
  );
};

export default MainMenu;
