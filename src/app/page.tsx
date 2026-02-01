import { ViewTransition } from 'react';
import Link from 'next/link';

export default function Main() {
  return (
    <div className='h-screen w-screen px-32 py-16 flex'>
      <ViewTransition name='game-area'>
        <div className='flex-1 h-full bg-white/10 rounded-xl flex items-center justify-center'>
          <Link href={'/play'} className='bg-white/20 p-4 rounded-xl font-bold'>Go to Play Area</Link>
        </div>
      </ViewTransition>
    </div>
  )
}
