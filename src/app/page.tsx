import { ViewTransition } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import HomeStats from '@/components/home-stats';
import StickerToggle from '@/components/sticker-toggle';

export const metadata: Metadata = {
  title: 'Circuit Rush',
  description: 'Three-lap racing simulation with local lap records.',
};

export default function Main() {
  return (
    <div className='min-h-screen w-screen px-6 py-12 md:px-32 md:py-16 flex flex-col items-start bg-white'>
      <ViewTransition name='game-area'>
        <h1 className='text-8xl font-bold mt-4 text-black relative'>
          Circuit Rush
          <StickerToggle className='absolute -top-4 -right-4' />
        </h1>
        <Link href={'/play'} className='mt-8 rounded bg-neutral-950 px-8 py-4 text-xl font-bold text-white'>
          Play
        </Link>
        <HomeStats />
      </ViewTransition>
    </div>
  )
}
