import { ViewTransition } from 'react';
import Link from 'next/link';
import StickerToggle from '@/components/sticker-toggle';

export default function Main() {
  return (
    <div className='h-screen w-screen px-6 py-12 md:px-32 md:py-16 flex flex-col items-start bg-white'>
      <ViewTransition name='game-area'>
        <div className='w-full aspect-video bg-[#F4F4F4] rounded flex items-center justify-center'>
          <Link href={'/play'} className='bg-white/20 p-4 rounded-xl font-bold'>Go to Play Area</Link>
        </div>
        <h1 className='text-8xl font-bold mt-4 text-black relative'>
          Circuit Rush
          <StickerToggle className='absolute -top-4 -right-4' />
        </h1>
      </ViewTransition>
    </div>
  )
}
