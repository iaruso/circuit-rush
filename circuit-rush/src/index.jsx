import './style.css';
import { createRoot } from 'react-dom/client';
import { Suspense, useEffect, useState, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { gsap } from 'gsap';
import { useDetectGPU, PerformanceMonitor, useProgress, Html } from '@react-three/drei';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import Filter from 'bad-words';
import ConfettiExplosion from 'react-confetti-explosion';
import Experience from './Experience.jsx';
import useGame from './stores/Game.jsx';
import UserControls from './UserControls';
import MainMenu from './MainMenu.jsx';
import Keyboard from './Keyboard.jsx';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

function App() {
	const [isVolumeOn, setIsVolumeOn] = useState(true);
	const [countdownSound] = useState(() => new Audio('./static/countdown.mp3'));
  const [countdownStartSound] = useState(() => new Audio('./static/countdown-start.mp3'));
	const [clickSound] = useState(() => new Audio('./static/click.mp3'));
	const [gameBrightness, setGameBrightness] = useState(0.5);
  const [gameStarted, setGameStarted] = useState(false);
  const GPUTier = useDetectGPU();
  const [performanceMode, setPerformanceMode] = useState(0);
  const [dpr, setDpr] = useState(0.5);
	const [minDpr, setMinDpr] = useState(0.5);
	const [maxDpr, setMaxDpr] = useState(0.8);
	const [frenchKeyboard, setFrenchKeyboard] = useState(false);
	const keyboardContent = useRef(null);
	const loadingRef = useRef(null);
	const countdownValue = useRef(null);
	const [loadingStatus, setLoadingStatus] = useState(false);
	const [gameLoaded, setGameLoaded] = useState(false);
	const [gamePaused, setGamePaused] = useState(false);
	const [gamePlaying, setGamePlaying] = useState(false);
	const [pauseMenu, setPauseMenu] = useState(false);
	const [finishStatus, setFinishStatus] = useState(false);
	const [leaderboardData, setLeaderboardData] = useState([]);
	const [leaderboardView, setLeaderboardView] = useState(false);
	const finishStats = useRef(null);
	const finishTime = useRef(null);
	const finishRecord = useRef(null);
	const [isExploding, setIsExploding] = useState(false);
	const pauseMenuRef = useRef(null);
	const [countdownStatus, setCountdownStatus] = useState(false);
	const [restartStatus, setRestartStatus] = useState(false);
	const countdown = useGame((state) => state.countdown);
	const start = useGame((state) => state.startGame);
	const pause = useGame((state) => state.pause);
	const resume = useGame((state) => state.resume);
	const restart = useGame((state) => state.restart);

	const userId = localStorage.getItem('user-id');
  const userName = localStorage.getItem('user-name');
	const userInput = useRef(null);
  const filter = new Filter();
	const [error, setError] = useState(null);
	
	useEffect(() => { 
		console.log(
			`Welcome to Circuit Rush! 🚗\nHope you have fun with this game :)\n\nRepository: %chttps://github.com/iaruso/circuit-rush%c`,
			"color: #e55555; text-decoration: underline; cursor: pointer"
		);
	}, []);

	useEffect(() => {
    const deleteLocalStorageItem = () => {
      localStorage.removeItem('currentRecordTime');
      localStorage.setItem('newversion', 'true');
    };
    const isNewVersion = localStorage.getItem('newversion');
    if (isNewVersion != 'true') {
      deleteLocalStorageItem();
    }
  }, []);

	const toggleVolume = () => {
		setIsVolumeOn(prevState => !prevState);
	};

	useEffect(() => {
		const language = navigator.language;
		if (language.startsWith('fr')) {
			setFrenchKeyboard(true);
		} else {
			setFrenchKeyboard(false);
		}
	}, [frenchKeyboard]);

	useEffect(() => {
    const userId = localStorage.getItem('user-id');
    if (!userId) {
      const newUserId = uuidv4().replace(/-/g, '').slice(0, 32);
      localStorage.setItem('user-id', newUserId);
    }
  }, []);

	useEffect(() => {
		GPUTier.fps > 60 ? setPerformanceMode(2) : GPUTier.fps > 30 ? setPerformanceMode(1) : setPerformanceMode(0);
		if (performanceMode == 2) {
			setDpr(1);
			setMinDpr(0.8);
			setMaxDpr(2);
		} else if ( performanceMode == 1) {
			setDpr(0.8);
			setMinDpr(0.6);
			setMaxDpr(1.2);
		} else {
			setDpr(0.5);
			setMinDpr(0.5);
			setMaxDpr(0.8);
		}
	}, [performanceMode]);

	const { phase, startTime, endTime } = useGame((state) => state);

	const formattedTime = useMemo(() => {
    function padWithZero(number, width = 2) {
			const paddedNumber = String(number);
			return paddedNumber.padStart(width, '0');
		}

    if (phase === 'ended') {
			let elapsedTime = 0;
			elapsedTime = endTime - startTime;
			const minutes = Math.floor((elapsedTime / 60000) % 60);
			const seconds = Math.floor((elapsedTime / 1000) % 60);
			const milliseconds = elapsedTime % 1000;
			return `${padWithZero(minutes)}:${padWithZero(seconds)}:${padWithZero(milliseconds, 3)}`;
    }
    return ''; // Return an empty string if phase is not 'ended'
	}, [phase]);

	useEffect(() => {
		function padWithZero(number, width = 2) {
			return String(number).padStart(width, '0');
		}

		if (phase === 'ended') {
			setFinishStatus(true);
			let elapsedTime = endTime - startTime;
			let currentRecordTime = localStorage.getItem('currentRecordTime');
			let timeDifference = 0;
			setTimeout(() => {
				gsap.to(finishStats.current, {opacity: 1, duration: 1.5});
				if (currentRecordTime > elapsedTime) {
					localStorage.setItem('currentRecordTime', elapsedTime);
					timeDifference = currentRecordTime - elapsedTime;
					const data = { time: formattedTime };
					axios.patch(`https://circuit-rush-api.vercel.app/api/records/${userId}`, data, {
						headers: {
							'Content-Type': 'application/json',
							'record-id': userId
						}
					}).then(() => {
						setLeaderboardView(true);
						setTimeout(() => {
							finishTime.current.innerHTML = `${formattedTime}<br><span class="better-time">(-${padWithZero(Math.floor(timeDifference / 60000) % 60)}:${padWithZero(Math.floor(timeDifference / 1000) % 60)}:${padWithZero(timeDifference % 1000, 3)})</span>`;
							finishRecord.current.innerHTML = "New record!";
							setIsExploding(true);
						}, 200);
					});
				} else {
					timeDifference = elapsedTime - currentRecordTime;
					if (!currentRecordTime) {
						finishTime.current.innerHTML = formattedTime;
						setIsExploding(true);
					} else {
						timeDifference = elapsedTime - currentRecordTime;
						setLeaderboardView(true);
						setTimeout(() => {
							if (timeDifference == 0) {
								finishTime.current.innerHTML = formattedTime;
								finishRecord.current.innerHTML = "How is that possible?";
							} else {
								finishTime.current.innerHTML = `${formattedTime}<br><span class="worse-time">(+${padWithZero(Math.floor(timeDifference / 60000) % 60)}:${padWithZero(Math.floor(timeDifference / 1000) % 60)}:${padWithZero(timeDifference % 1000, 3)})</span>`;
								finishRecord.current.innerHTML = "You did better once.";
							}
						}, 200);
					}
				}
			}, 200);
		}
	}, [phase, formattedTime]);

	useEffect(() => {
		if (phase === "ended" && userId && userName && leaderboardView) {
			setTimeout(() => {
				const leaderboardList = document.querySelector('.leaderboard-list');
    		leaderboardList.classList.add('loading');
			}, 50)
			axios.get('https://circuit-rush-api.vercel.app/api/get-records')
				.then(response => {
					setLeaderboardData(response.data);
					const leaderboardList = document.querySelector('.leaderboard-list');
					leaderboardList.classList.remove('loading');
					setTimeout(() => {
						const userElement = document.querySelector('.leaderboard-list-item.user');
						if (userElement && leaderboardList) {
							userElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
						}
					}, 200);
				})
		}
  }, [leaderboardView]);

	const handleSubmit = () => {
		const button = document.querySelector('button.submit-user');
    button.classList.add('loading');
		setError(null);
		const inputValue = userInput.current.value.trim().toUpperCase();;
		const inputPattern = /^[a-zA-Z0-9]+$/;
		if (inputPattern.test(inputValue) && inputValue.length > 0 && inputValue.length <= 12 && !filter.isProfane(inputValue)) {
			const data = {
				user: inputValue,
				time: formattedTime
			};
			axios.post('https://circuit-rush-api.vercel.app/api/post-record', data, {
				headers: {
					'Content-Type': 'application/json',
					'record-id': userId
				}
			})
			.then(response => {
				button.classList.remove('loading');
				if (response.status === 200) {
					localStorage.setItem('user-name', inputValue);
					localStorage.setItem('currentRecordTime', endTime - startTime);
					setLeaderboardView(true);
					setTimeout(() => {
						finishTime.current.innerHTML = formattedTime;
						finishRecord.current.innerHTML = "Compete against others!";
					}, 200);
				} else {
					setError('Failed to submit record.');
				}
			})
			.catch(error => {
				if (error.response && error.response.status === 409) {
						setError('Name already in use.');
				} else {
						console.error('Error:', error);
						setError('Failed to submit record.');
				}
				button.classList.remove('loading');
			});			
		} else {
			setTimeout(() => {
				setError('Please enter a valid user name.');
				button.classList.remove('loading');
			}, 200)
		}
	};	
	
  const clearError = () => {
    setError(null);
  };

	const handlePause = () => {
		setPauseMenu(true);
		setGamePaused(true);
	};

	const quitButton = () => {
		setTimeout(() => {
    	window.location.reload();
		}, 500);
	};

	const handleCanvasKeyDown = (event) => { 
		if (!gameStarted || !gameLoaded) {
			event.preventDefault();
		}
	};

	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			if (loadingStatus && !gamePlaying) {
				clickSound.volume = isVolumeOn ? 0.05 : 0;;
				clickSound.play();
				setGamePlaying(true);
				setTimeout (() => {
					setGameLoaded(true);
					setCountdownStatus(true);
					countdown();
				}, 200);
			}
		}
		if (event.key === 'p' || event.key === 'P') {
			if (phase === 'playing') {
				handlePause();
			}
		}
		if (event.key === 'Escape') {
			if (phase === 'playing' || phase === 'paused' || phase === 'ended') {
				quitButton();
			}
		}
	};
	
	const resumeButton = () => {
		gsap.to(pauseMenuRef.current, {opacity: 0, duration: 0.8 });
		setTimeout(() => {
			resume(); /* useEffect not working and I don't know why */
			setGamePaused(false);
			setPauseMenu(false);
		}, 500);
	};

	const restartButton = () => {
		if (phase === 'ended') {
			setCountdownStatus(false);
			setFinishStatus(false);
			setLeaderboardView(false);
			setIsExploding(false);
			setTimeout(() => { 
				setCountdownStatus(true);
			}, 2000);
		}
		if (phase === 'paused')  {
			setTimeout(() => { 
				setCountdownStatus(true);
			}, 2000);
		}
		setPauseMenu(false);
		setRestartStatus(true);
		setTimeout(() => {
			setRestartStatus(false);
			setGamePaused(false);
			restart();
		}, 1000);
	};

	useEffect(() => {
		if (phase === 'loading') {
			setTimeout(() => { 
				setGameStarted(true);
			}, 200);
		}
	}, [phase]);

	useEffect(() => {
		let timer;
		const countdown = async () => {
			for (let count = 3; count >= 1; count--) {
				countdownValue.current.textContent = count;
				gsap.fromTo(countdownValue.current, { opacity: 1, scale: 1.2 }, { opacity: 0, scale: 1, duration: 0.6, delay: 0.4 });
				countdownSound.volume = isVolumeOn ? 0.1 : 0;
				countdownSound.play();
				await delay(1000);
			}
			countdownValue.current.textContent = 'GO';
			gsap.fromTo(countdownValue.current, { opacity: 1, scale: 1.2 }, { opacity: 0, scale: 1, duration: 0.6, delay: 0.4 });
			countdownStartSound.volume = isVolumeOn ? 0.1 : 0;
			countdownStartSound.play();
			setTimeout(() => {
				setCountdownStatus(false);
			}, 1000);
			setTimeout(() => { 
				start();
			}, 200);
		};

		const delay = (ms) => {
			return new Promise((resolve) => setTimeout(resolve, ms));
		};

		if (countdownStatus) {
			timer = setTimeout(countdown, 500);
		}

		return () => {
			clearTimeout(timer);
		};
	}, [countdownStatus]);

	useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStarted, gameLoaded, loadingStatus, phase]);

	useEffect(() => {
    if (keyboardContent.current) {
			const keyboardElement = keyboardContent.current;
			const animation = gsap.fromTo(
				keyboardElement,
				{ opacity: 0 },
				{ opacity: 1, duration: 1.5 }
			);
			return () => {
				animation.kill();
      	clearTimeout(timeout);
    	};
    }
  }, [gameStarted, keyboardContent]);

	useEffect(() => {
		if (loadingStatus) {
			const textElement = loadingRef.current;
			const animation = gsap.fromTo(
				textElement,
				{ opacity: 0 },
				{ opacity: 1, yoyo: true, repeat: -1, duration: 1, ease: 'power2.inOut' }
			);
			return () => {
				animation.kill();
			};
		}
	}, [loadingStatus]);

	function Loader() {
		const { progress } = useProgress()
		loadingRef.current.textContent = progress.toFixed(0) + '%';
		if ( progress > 99.9 ) {
			setTimeout(() => {
				setLoadingStatus(true);
				loadingRef.current.textContent = 'PRESS ENTER TO PLAY';
			}, 2000);
		}
		return <></>
	}

  useEffect(() => {
    const storedBrightness = localStorage.getItem('gameBrightness');
		const storedVolume = localStorage.getItem('isVolumeOn');
    if (storedBrightness !== null) {
      setGameBrightness(parseFloat(storedBrightness));
    }
		if (storedVolume !== null) {
			setIsVolumeOn(JSON.parse(storedVolume));
		}
  }, []);

  useEffect(() => {
    localStorage.setItem('gameBrightness', gameBrightness.toString());
  }, [gameBrightness]);

	useEffect(() => {
		localStorage.setItem('isVolumeOn', isVolumeOn);
	}, [isVolumeOn]);

  function handleBrightnessChange(e) {
    setGameBrightness(e.target.value);
  }

	const handleGamePause = () => {
		if (phase === 'playing') {
			handlePause();
		}
	};

	useEffect(() => { 
		if (gamePaused) {
			pause();
		} else {
			resume();
		}
	}, [gamePaused]);

	function filterme(value) {
    const toggleElement = document.getElementById('custom-toggle');
		value = parseFloat(value);
    if (value === 0) {
      toggleElement.classList.remove('tgl-max', 'tgl-med');
      toggleElement.classList.add('tgl-min');
    } else if (value === 0.5) {
      toggleElement.classList.remove('tgl-min', 'tgl-max');
      toggleElement.classList.add('tgl-med');
    } else if (value === 1) {
      toggleElement.classList.remove('tgl-min', 'tgl-med');
      toggleElement.classList.add('tgl-max');
    }
  }

  return (
		<>
			{!gameStarted ? (
				<MainMenu isVolumeOn={isVolumeOn}/>
			) : (
				<>
					{!gameLoaded ? (
						<div className='loading-screen'>
							<div className="keyboard-controls" ref={keyboardContent}>
								<Keyboard keyboardType={frenchKeyboard} />
							</div>
							<div ref={loadingRef} className="loading-info"></div>
						</div>
					) : null}
					<UserControls>
						<Canvas
							onKeyDown={handleCanvasKeyDown}
							dpr={dpr}
							shadows={performanceMode > 0 ? 'soft' : 'basic'}
						>
							<Suspense fallback={<Loader />}>
							{!restartStatus?
								<>
									<color attach="background" args={['#F7F7F7']} />
									<PerformanceMonitor onIncline={() => setDpr(minDpr)} onDecline={() => setDpr(maxDpr)}>
										<Experience performanceMode={performanceMode} gameBrightness={gameBrightness} isVolumeOn={isVolumeOn}/>
									</PerformanceMonitor>
								</>
								: null
							}
							</Suspense>
							{countdownStatus ? 
								<Html wrapperClass={'countdown-overlay'} className='countdown-stats'>
									<p ref={countdownValue} className='countdown-value'></p>
								</Html>
								: null
							}
							{pauseMenu ? 
								<Html wrapperClass={'pause-overlay'} className='pause-menu-overlay' ref={pauseMenuRef}>
									<div className='pause-menu'>
										<div className='pause-menu-options'>
											<p className='pause-menu-title'>GAME PAUSED</p>
											<button onClick={resumeButton}>RESUME</button>
											<button onClick={restartButton}>RESTART</button>
											<button onClick={quitButton}>QUIT</button>
											<div className='game-settings'>
												<div className='section'>
														<div className='wrapper'>
															<input id="custom-toggle" className={gameBrightness == 0 ? "tgl-min" : gameBrightness == 1 ? "tgl-max" : "tgl-med"} type="range" min="0" max="1" step="0.5" value={gameBrightness} onChange={(e) => {
																handleBrightnessChange(e);
																filterme(e.target.value);
															}} />
															<span></span>
														</div>
												</div>
												<div className='section'>
													<div onClick={toggleVolume} className='game-option-btn'>
														{isVolumeOn ? (
															<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
																<path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320Z"/>
															</svg>
														) : (
															<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
																<path d="M792-56 671-177q-25 16-53 27.5T560-131v-82q14-5 27.5-10t25.5-12L480-368v208L280-360H120v-240h128L56-792l56-56 736 736-56 56Zm-8-232-58-58q17-31 25.5-65t8.5-70q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 53-14.5 102T784-288ZM650-422l-90-90v-130q47 22 73.5 66t26.5 96q0 15-2.5 29.5T650-422ZM480-592 376-696l104-104v208Z"/>
															</svg>
														)}
													</div>
												</div>
											</div>
										</div>
									</div>
								</Html>
								: null
							}
							{finishStatus && !leaderboardView && !userName? 
								<Html wrapperClass={'finish-overlay'} className='finish-stats' ref={finishStats}>
									<>{isExploding && <ConfettiExplosion force={0.4} duration={4000} particleSize={8} particleCount={128} width={window.innerWidth > 1080 ? window.innerWidth / 2 : window.innerWidth * 0.8} colors={['#e55555', '#db3d3d', '#e55555', '#fc4c4c']} className='confetti-explosion'/>}</>
									<div className="finish-time" ref={finishTime}></div>
									<input className="new-user" ref={userInput} placeholder='Insert your name'/>
              		<button type='submit' className='submit-user' onClick={handleSubmit}>CONFIRM</button>
									{error && (
										<span className="error-message">{error}</span>
									)}
								</Html>
								: null
							}
							{finishStatus && leaderboardView && userName? 
								<Html wrapperClass={'leaderboard-overlay'} className='leaderboard-stats' ref={finishStats}>
									<>{isExploding && <ConfettiExplosion force={0.4} duration={4000} particleSize={8} particleCount={128} width={window.innerWidth > 1080 ? window.innerWidth / 2 : window.innerWidth * 0.8} colors={['#e55555', '#db3d3d', '#e55555', '#fc4c4c']} className='confetti-explosion'/>}</>
									<div className='leaderboard-header'>
										<div className="finish-record" ref={finishRecord}></div>
										<div className="finish-time" ref={finishTime}></div>
									</div>
									<div className='leaderboard-list-area'>
										<div className='leaderboard-list'>
											{leaderboardData.map((item, index) => (
												<div className={`leaderboard-list-item ${item.user === userName ? 'user' : ''}`} key={index}>
													<div className='leaderboard-list-item-content'>
														<div className='position'>{index + 1}</div>
														<div className='name'>{item.user}</div>
														<div className='time'>{item.time}</div>
													</div>
												</div>
											))}
										</div>
									</div>
									<div className='leaderboard-options'>
										<button onClick={restartButton}>RESTART</button>
										<button onClick={quitButton}>QUIT</button>
									</div>
								</Html>
								: null
							}
							{!gamePaused && gameLoaded && !countdownStatus && (phase == 'playing' || phase == 'paused') ?
								<Html wrapperClass={'pause-button-overlay'} className='pause-button'>
									<a id='pause-btn' className="game-option-btn" onClick={handleGamePause}>
										<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M560-200v-560h160v560H560Zm-320 0v-560h160v560H240Z"/></svg>
									</a>
								</Html>
								: null
							}
						</Canvas>
					</UserControls>
				</>
			)}
		</>
	);
}

root.render(
	<App />
);