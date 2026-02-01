'use client'
import { useCompoundBody } from '@react-three/cannon'
import { type RefObject, useRef } from 'react'
import type { Group } from 'three'

export interface WheelInfo {
  radius: number
  directionLocal: [number, number, number]
  axleLocal: [number, number, number]
  suspensionStiffness: number
  suspensionRestLength: number
  frictionSlip: number
  dampingRelaxation: number
  dampingCompression: number
  maxSuspensionForce: number
  rollInfluence: number
  maxSuspensionTravel: number
  customSlidingRotationalSpeed: number
  useCustomSlidingRotationalSpeed: boolean
  chassisConnectionPointLocal: [number, number, number]
  isFrontWheel: boolean
  color?: string
}

export type WheelsReturn = [RefObject<Group | null>[], WheelInfo[]]

export const useWheels = (front: number, radius: number): WheelsReturn => {
  const wheels = [
    useRef<Group | null>(null),
    useRef<Group | null>(null),
    useRef<Group | null>(null),
    useRef<Group | null>(null),
  ]

  const wheelInfo = {
    radius,
    directionLocal: [0, -1, 0] as [number, number, number],
    axleLocal: [-1, 0, 0] as [number, number, number],
    suspensionStiffness: 40,
    suspensionRestLength: 0.4,
    frictionSlip: 4.2,
    dampingRelaxation: 8,
    dampingCompression: 1,
    maxSuspensionForce: 200000,
    rollInfluence: 0.01,
    maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: -90,
    useCustomSlidingRotationalSpeed: true,
  }

  const wheelInfos: WheelInfo[] = [
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [-0.7, 0.05, -front + 0.5],
      isFrontWheel: false,
      color: 'red',
      frictionSlip: 3.6,
    },
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [0.7, 0.05, -front + 0.5],
      isFrontWheel: false,
      color: 'red',
      frictionSlip: 3.6,
    },
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [-0.7, 0.05, front - 0.5],
      isFrontWheel: true,
      frictionSlip: 4.5,
    },
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [0.7, 0.05, front - 0.5],
      isFrontWheel: true,
      frictionSlip: 4.5,
    },
  ]

  const shape = {
    args: [wheelInfo.radius, wheelInfo.radius, 0.3, 32] as [number, number, number, number],
    rotation: [0, 0, Math.PI / 2] as [number, number, number],
    type: 'Cylinder' as const,
  }

  const createProps = (mass: number) => ({
    collisionFilterGroup: 0,
    mass,
    shapes: [shape],
    type: 'Kinematic' as const,
  })

  useCompoundBody(() => createProps(60), wheels[0])
  useCompoundBody(() => createProps(60), wheels[1])
  useCompoundBody(() => createProps(40), wheels[2])
  useCompoundBody(() => createProps(40), wheels[3])

  return [wheels, wheelInfos]
}
