'use client'
import { FC, ReactNode} from 'react'
import { createContext, useContext, useEffect } from 'react'
import { folder, useControls as useLevaControls } from 'leva'

type ControlsType = {
  controls: {
    scene: {
      grid: {
        size: [number, number]
        cellSize: number
        cellThickness: number
        cellColor: string
        sectionSize: number
        sectionThickness: number
        sectionColor: string
        fadeDistance: number
        fadeStrength: number
        followCamera: boolean
        infiniteGrid: boolean
      }
    }
    vehicle: {
      body: {
        vehicleSize: [number, number, number] // length, height, width
        mass: number
        wheels: {
          wheelSize: [number, number] // radius and width
          front: {
            force: number
          }
          back: {
            force: number
          }
        }
      }
      gears: {
        gearRatio1: number
        gearRatio2: number
        gearRatio3: number
        gearRatio4: number
        gearRatio5: number
        gearRatio6: number
        gearRatio7: number
        finalDrive: number
      }
    }
  }
}

const defaultValues: ControlsType = {
  controls: {
    scene: {
      grid: {
        size: [10, 10],
        cellSize: 1,
        cellThickness: 1,
        cellColor: '#E5EAF6',
        sectionSize: 5,
        sectionThickness: 1.5,
        sectionColor: '#E5EAF6',
        fadeDistance: 25,
        fadeStrength: 1,
        followCamera: false,
        infiniteGrid: true,
      },
    },
    vehicle: {
      body: {
        vehicleSize: [4, 0.5, 2], // length, height, width
        mass: 1000,
        wheels: {
          wheelSize: [0.33, 0.4], // radius and width
          front: {
            force: 3000,
          },
          back: {
            force: 2000,
          },
        },
      },
      gears: {
        gearRatio1: 3.2,
        gearRatio2: 2.4,
        gearRatio3: 1.9,
        gearRatio4: 1.6,
        gearRatio5: 1.3,
        gearRatio6: 1.05,
        gearRatio7: 0.85,
        finalDrive: 3.5,
      },
    },
  },
}

const ControlsContext = createContext<ControlsType>(defaultValues)

export const ControlsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const getStoredValue = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue
    try {
      const stored = localStorage.getItem('controls')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed && key in parsed) return parsed[key]
      }
    } catch {}
    return defaultValue
  }

  const controls = useLevaControls({
    Scene: folder({
      Grid: folder(
        {
          gridSize: {
            value: getStoredValue('gridSize', [10, 10]),
          },
          cellSize: {
            value: getStoredValue('cellSize', 1),
            min: 0,
            max: 10,
            step: 0.1,
          },
          cellThickness: {
            value: getStoredValue('cellThickness', 1),
            min: 0,
            max: 5,
            step: 0.1,
          },
          cellColor: {
            value: getStoredValue('cellColor', '#E5EAF6'),
          },
          sectionSize: {
            value: getStoredValue('sectionSize', 5),
            min: 0,
            max: 10,
            step: 0.1,
          },
          sectionThickness: {
            value: getStoredValue('sectionThickness', 1.5),
            min: 0,
            max: 5,
            step: 0.1,
          },
          sectionColor: {
            value: getStoredValue('sectionColor', '#E5EAF6'),
          },
          fadeDistance: {
            value: getStoredValue('fadeDistance', 25),
            min: 0,
            max: 100,
            step: 1,
          },
          fadeStrength: {
            value: getStoredValue('fadeStrength', 1),
            min: 0,
            max: 1,
            step: 0.1,
          },
          followCamera: {
            value: getStoredValue('followCamera', false),
          },
          infiniteGrid: {
            value: getStoredValue('infiniteGrid', true),
          },
        },
        { collapsed: true, color: '#4A90E2' },
      ),
    }),
    Vehicle: folder(
      {
        Body: folder({
          vehicleSize: {
            value: getStoredValue('vehicleSize', [4, 0.5, 2]), // length, height, width
            min: [3, 0.2, 1],
            max: [5, 1, 3],
            step: [0.1, 0.1, 0.1],
          },
          mass: {
            value: getStoredValue('mass', 1000),
            min: 500,
            max: 2000,
            step: 1,
          },
        }),
        Wheels: folder({
          wheelSize: {
            value: getStoredValue('wheelSize', [0.25, 0.5]), // radius and width
            min: [0.1, 0.1],
            max: [0.5, 1],
            step: [0.01, 0.01],
          },
          frontForce: {
            value: getStoredValue('frontForce', 3000),
            min: 0,
            max: 5000,
            step: 100,
          },
          backForce: {
            value: getStoredValue('backForce', 2000),
            min: 0,
            max: 5000,
            step: 100,
          },
        }),
        Gears: folder({
          gearRatio1: {
            value: getStoredValue('gearRatio1', 3.2),
            min: 2.0,
            max: 20.0,
            step: 0.1,
          },
          gearRatio2: {
            value: getStoredValue('gearRatio2', 2.4),
            min: 1.5,
            max: 3.0,
            step: 0.1,
          },
          gearRatio3: {
            value: getStoredValue('gearRatio3', 1.9),
            min: 1.2,
            max: 2.5,
            step: 0.1,
          },
          gearRatio4: {
            value: getStoredValue('gearRatio4', 1.6),
            min: 1.0,
            max: 2.0,
            step: 0.1,
          },
          gearRatio5: {
            value: getStoredValue('gearRatio5', 1.3),
            min: 0.8,
            max: 1.8,
            step: 0.1,
          },
          gearRatio6: {
            value: getStoredValue('gearRatio6', 1.05),
            min: 0.7,
            max: 1.5,
            step: 0.1,
          },
          gearRatio7: {
            value: getStoredValue('gearRatio7', 0.85),
            min: 0.5,
            max: 1.2,
            step: 0.1,
          },
          finalDrive: {
            value: getStoredValue('finalDrive', 3.5),
            min: 2.0,
            max: 5.0,
            step: 0.1,
          },
        }),
      },
      { collapsed: false, color: '#4A90E2' },
    ),
  })

  useEffect(() => {
    localStorage.setItem('controls', JSON.stringify(controls))
    const prev = JSON.parse(localStorage.getItem('controlsHistory') || '[]')
    localStorage.setItem('controlsHistory', JSON.stringify([...prev, controls]))
  }, [controls])

  const mappedControls: ControlsType = {
    controls: {
      scene: {
        grid: {
          size: controls.gridSize,
          cellSize: controls.cellSize,
          cellThickness: controls.cellThickness,
          cellColor: controls.cellColor,
          sectionSize: controls.sectionSize,
          sectionThickness: controls.sectionThickness,
          sectionColor: controls.sectionColor,
          fadeDistance: controls.fadeDistance,
          fadeStrength: controls.fadeStrength,
          followCamera: controls.followCamera,
          infiniteGrid: controls.infiniteGrid,
        },
      },
      vehicle: {
        body: {
          vehicleSize: controls.vehicleSize,
          mass: controls.mass,
          wheels: {
            wheelSize: controls.wheelSize,
            front: {
              force: controls.frontForce,
            },
            back: {
              force: controls.backForce,
            },
          },
        },
        gears: {
          gearRatio1: controls.gearRatio1,
          gearRatio2: controls.gearRatio2,
          gearRatio3: controls.gearRatio3,
          gearRatio4: controls.gearRatio4,
          gearRatio5: controls.gearRatio5,
          gearRatio6: controls.gearRatio6,
          gearRatio7: controls.gearRatio7,
          finalDrive: controls.finalDrive,
        },
      },
    },
  }

  return <ControlsContext.Provider value={mappedControls}>{children}</ControlsContext.Provider>
}

export const useControls = () => useContext(ControlsContext)