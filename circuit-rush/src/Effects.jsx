import { N8AO, SMAA, SSR, DepthOfField, EffectComposer } from '@react-three/postprocessing'

export default function Effects() {
    return <EffectComposer>
        <N8AO color="red" aoRadius={2.4} intensity={1.2} aoSamples={10} denoiseSamples={8} quality='low'/>
        <SMAA />
        <DepthOfField
            focusDistance={ 100 }
            focalLength={ 10 }
            bokehScale={ 1 }
        />
    </EffectComposer>
}