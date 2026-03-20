'use client';

import { useRef, useState } from 'react';

type StickerMode = 'rev' | 'le';

type StickerAsset = {
  avif: string;
  png: string;
  label: string;
};

const STICKER_ASSETS: Record<StickerMode, StickerAsset> = {
  rev: {
    avif: '/images/rev.avif',
    png: '/images/rev.png',
    label: 'Revived edition',
  },
  le: {
    avif: '/images/le.avif',
    png: '/images/le.png',
    label: 'Legacy edition',
  },
};

interface StickerToggleProps {
  className?: string;
  initialMode?: StickerMode;
  onModeChange?: (mode: StickerMode) => void;
}

function StickerLayer({
  mode,
  className,
  altSuffix,
  isActive,
}: {
  mode: StickerMode;
  className: string;
  altSuffix: string;
  isActive: boolean;
}) {
  const asset = STICKER_ASSETS[mode];

  return (
    <span
      className={`${className} ${isActive ? 'scale-100 opacity-100' : 'scale-50 opacity-0'} transition-all duration-300 ease-out`}
    >
      <picture className='block h-full w-full rounded-[1.35rem] [filter:drop-shadow(8px_0_0_rgba(0,0,0,1))_drop-shadow(-8px_0_0_rgba(0,0,0,1))_drop-shadow(0_8px_0_rgba(0,0,0,1))_drop-shadow(0_-8px_0_rgba(0,0,0,1))_drop-shadow(6px_6px_0_rgba(0,0,0,1))_drop-shadow(-6px_6px_0_rgba(0,0,0,1))_drop-shadow(6px_-6px_0_rgba(0,0,0,1))_drop-shadow(-6px_-6px_0_rgba(0,0,0,1))_drop-shadow(16px_0_0_rgba(255,255,255,0.98))_drop-shadow(-16px_0_0_rgba(255,255,255,0.98))_drop-shadow(0_16px_0_rgba(255,255,255,0.98))_drop-shadow(0_-16px_0_rgba(255,255,255,0.98))_drop-shadow(11px_11px_0_rgba(255,255,255,0.98))_drop-shadow(-11px_11px_0_rgba(255,255,255,0.98))_drop-shadow(11px_-11px_0_rgba(255,255,255,0.98))_drop-shadow(-11px_-11px_0_rgba(255,255,255,0.98))]'>
        <source srcSet={asset.avif} type='image/avif' />
        <img
          src={asset.png}
          alt={`${asset.label} sticker ${altSuffix}`}
          className='h-full w-full rounded-[1.35rem] object-cover select-none'
          draggable={false}
        />
      </picture>
    </span>
  );
}

export default function StickerToggle({
  className = '',
  initialMode = 'rev',
  onModeChange,
}: StickerToggleProps) {
  const [mode, setMode] = useState<StickerMode>(initialMode);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isAnimatingRef = useRef(false);

  const nextMode: StickerMode = mode === 'rev' ? 'le' : 'rev';

  const handleToggle = () => {
    if (isAnimatingRef.current) {
      return;
    }

    isAnimatingRef.current = true;
    buttonRef.current?.setAttribute('data-peeling', 'true');
  };

  const handlePeelEnd = () => {
    if (!isAnimatingRef.current) {
      return;
    }

    isAnimatingRef.current = false;
    buttonRef.current?.removeAttribute('data-peeling');

    setMode((currentMode) => {
      const updatedMode: StickerMode = currentMode === 'rev' ? 'le' : 'rev';
      onModeChange?.(updatedMode);
      return updatedMode;
    });
  };

  return (
    <button
      ref={buttonRef}
      type='button'
      onClick={handleToggle}
      onAnimationEnd={handlePeelEnd}
      aria-label={`Toggle edition. Current mode is ${STICKER_ASSETS[mode].label}.`}
      aria-pressed={mode === 'rev'}
      className={`group relative isolate h-36 w-36 cursor-pointer rounded-[1.35rem] data-[peeling=true]:cursor-default md:h-40 md:w-40 ${className}`}
    >
      <StickerLayer
        mode={nextMode}
        altSuffix='below'
        isActive={false}
        className='absolute inset-0 opacity-90 transition-transform duration-200 ease-out group-hover:-translate-y-1 group-hover:-rotate-3 group-data-[peeling=true]:scale-100 group-data-[peeling=true]:opacity-100'
      />

      <StickerLayer
        mode={mode}
        altSuffix='top'
        isActive
        className='absolute inset-0 [transform-origin:top_left] transition-transform duration-200 ease-out group-hover:-translate-y-1 group-hover:-rotate-3 group-data-[peeling=true]:animate-[sticker-peel_420ms_cubic-bezier(.2,.8,.2,1)_forwards]'
      />
    </button>
  );
}
