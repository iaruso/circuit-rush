import { N8AO, SMAA, Sepia, DepthOfField, EffectComposer } from '@react-three/postprocessing'

export default function Effects() {
    return <EffectComposer>
        <N8AO color="red" aoRadius={2.4} intensity={1.2} aoSamples={4} denoiseSamples={2} quality='low'/>
        <SMAA />
        {/* <Sepia intensity={0.1}/> */}
        <DepthOfField
            focusDistance={ 100 }
            focalLength={ 10 }
            bokehScale={ 1 }
        />
    </EffectComposer>
}