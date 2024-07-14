'use client'
import { useState } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'

import { Disc3 } from 'lucide-react'
import ReactPlayer from 'react-player/soundcloud'
import Island from '@/components/island'

export default function PlayButton() {
  const [playing, setPlaying] = useState(false)

  return (
    <button
      className="btn btn-sm rounded-full"
      onClick={() => setPlaying(!playing)}
    >
      <Island>
        <ReactPlayer
          className="invisible !w-dvw !h-dvh fixed top-0 left-0 pointer-events-none"
          url="https://soundcloud.com/sontuph/city-pop-rain-lofi-ghibli-inspired-atmosphere-for-study-chillout-focus-relax"
          playing={playing}
          loop
        />
      </Island>
      chillout
      <motion.div
        className={clsx(
          'w-4 h-4 rounded-full bg-base-content flex flex-col items-center justify-center animate-[spin_2s_linear_infinite]',
          {
            '[animation-play-state:running]': playing,
            '[animation-play-state:paused]': !playing,
          },
        )}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Disc3 className="w-4 h-4 text-base-100" />
      </motion.div>
    </button>
  )
}