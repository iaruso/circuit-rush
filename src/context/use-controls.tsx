'use client'
import { FC, ReactNode, createContext, useContext } from 'react'
import { folder, useControls as useLevaControls } from 'leva'

// Flat default values for easy access
const defaults = {
  // Scene - Grid
  gridSize: [10, 10] as [number, number],
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

  // Vehicle - Body
  vehicleSize: [4, 0.5, 2] as [number, number, number],
  mass: 800,

  // Vehicle - Wheels
  wheelSize: [0.33, 0.4] as [number, number],
  frontForce: 4000,
  backForce: 3000,

  // Vehicle - Gears
  gearRatio1: 6.20,
  gearRatio2: 2,
  gearRatio3: 1.90,
  gearRatio4: 1.52,
  gearRatio5: 1.27,
  gearRatio6: 1.05,
  gearRatio7: 0.88,
  gearRatio8: 0.78,
  finalDrive: 3.9,
}

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
        vehicleSize: [number, number, number]
        mass: number
        wheels: {
          wheelSize: [number, number]
          front: { force: number }
          back: { force: number }
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
        gearRatio8: number
        finalDrive: number
      }
    }
  }
}

const defaultControls: ControlsType = {
  controls: {
    scene: {
      grid: {
        size: defaults.gridSize,
        cellSize: defaults.cellSize,
        cellThickness: defaults.cellThickness,
        cellColor: defaults.cellColor,
        sectionSize: defaults.sectionSize,
        sectionThickness: defaults.sectionThickness,
        sectionColor: defaults.sectionColor,
        fadeDistance: defaults.fadeDistance,
        fadeStrength: defaults.fadeStrength,
        followCamera: defaults.followCamera,
        infiniteGrid: defaults.infiniteGrid,
      },
    },
    vehicle: {
      body: {
        vehicleSize: defaults.vehicleSize,
        mass: defaults.mass,
        wheels: {
          wheelSize: defaults.wheelSize,
          front: { force: defaults.frontForce },
          back: { force: defaults.backForce },
        },
      },
      gears: {
        gearRatio1: defaults.gearRatio1,
        gearRatio2: defaults.gearRatio2,
        gearRatio3: defaults.gearRatio3,
        gearRatio4: defaults.gearRatio4,
        gearRatio5: defaults.gearRatio5,
        gearRatio6: defaults.gearRatio6,
        gearRatio7: defaults.gearRatio7,
        gearRatio8: defaults.gearRatio8,
        finalDrive: defaults.finalDrive,
      },
    },
  },
}

const ControlsContext = createContext<ControlsType>(defaultControls)

export const ControlsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const controls = useLevaControls({
    Scene: folder({
      Grid: folder({
        gridSize: { value: defaults.gridSize },
        cellSize: { value: defaults.cellSize, min: 0, max: 10, step: 0.1 },
        cellThickness: { value: defaults.cellThickness, min: 0, max: 5, step: 0.1 },
        cellColor: { value: defaults.cellColor },
        sectionSize: { value: defaults.sectionSize, min: 0, max: 10, step: 0.1 },
        sectionThickness: { value: defaults.sectionThickness, min: 0, max: 5, step: 0.1 },
        sectionColor: { value: defaults.sectionColor },
        fadeDistance: { value: defaults.fadeDistance, min: 0, max: 100, step: 1 },
        fadeStrength: { value: defaults.fadeStrength, min: 0, max: 1, step: 0.1 },
        followCamera: { value: defaults.followCamera },
        infiniteGrid: { value: defaults.infiniteGrid },
      }, { collapsed: true, color: '#4A90E2' }),
    }),
    Vehicle: folder({
      Body: folder({
        vehicleSize: {
          value: defaults.vehicleSize,
          min: [3, 0.2, 1],
          max: [5, 1, 3],
          step: [0.1, 0.1, 0.1],
        },
        mass: { value: defaults.mass, min: 500, max: 1000, step: 1 },
      }),
      Wheels: folder({
        wheelSize: {
          value: defaults.wheelSize,
          min: [0.1, 0.1],
          max: [0.5, 1],
          step: [0.01, 0.01],
        },
        frontForce: { value: defaults.frontForce, min: 0, max: 5000, step: 100 },
        backForce: { value: defaults.backForce, min: 0, max: 5000, step: 100 },
      }),
      Gears: folder({
        gearRatio1: { value: defaults.gearRatio1, min: 2.0, max: 20.0, step: 0.1 },
        gearRatio2: { value: defaults.gearRatio2, min: 1.5, max: 3.0, step: 0.1 },
        gearRatio3: { value: defaults.gearRatio3, min: 1.2, max: 2.5, step: 0.1 },
        gearRatio4: { value: defaults.gearRatio4, min: 1.0, max: 2.0, step: 0.1 },
        gearRatio5: { value: defaults.gearRatio5, min: 0.8, max: 1.8, step: 0.1 },
        gearRatio6: { value: defaults.gearRatio6, min: 0.7, max: 1.5, step: 0.1 },
        gearRatio7: { value: defaults.gearRatio7, min: 0.5, max: 1.2, step: 0.1 },
        gearRatio8: { value: defaults.gearRatio8, min: 0.4, max: 1.0, step: 0.1 },
        finalDrive: { value: defaults.finalDrive, min: 2.0, max: 5.0, step: 0.1 },
      }),
    }, { collapsed: false, color: '#4A90E2' }),
  })

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
            front: { force: controls.frontForce },
            back: { force: controls.backForce },
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
          gearRatio8: controls.gearRatio8,
          finalDrive: controls.finalDrive,
        },
      },
    },
  }

  return <ControlsContext.Provider value={mappedControls}>{children}</ControlsContext.Provider>
}

export const useControls = () => useContext(ControlsContext)