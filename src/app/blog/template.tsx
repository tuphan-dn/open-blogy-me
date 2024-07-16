'use client'
import { useMemo, type ReactNode } from 'react'
import { useSelectedLayoutSegments } from 'next/navigation'
import useSWR from 'swr'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

import Link from 'next/link'
import { Play } from 'lucide-react'
import { BlogCard } from '@/components/blog'
import Tags from '@/components/tags'
import { FacebookShare, TwitterShare } from './share'

export default function Template({ children }: { children: ReactNode }) {
  const segments = useSelectedLayoutSegments()
  const { data: { tags = [], children: routes = [] } = {} } = useSWR(
    `/api/blog/${segments.join('/')}`,
    async (api: string) => {
      const { data } = await axios.get<Blog>(api)
      return data
    },
  )

  const slugs = useMemo(
    () => [
      { name: 'blog', href: '/' },
      ...segments.map((segment, i, segments) => ({
        name: segment,
        href: ['/blog', ...segments.slice(0, i), segment].join('/'),
      })),
    ],
    [segments],
  )

  return (
    <div className="w-full flex flex-col gap-4 items-center">
      <motion.article
        className="w-full my-16 prose prose-p:tracking-[-.25px]"
        initial={{ y: 64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="not-prose fixed top-[50%] -translate-y-[50%] left-0 cursor-pointer group z-10 group">
          <div className="flex flex-col transition-all gap-1 group-hover:gap-2 m-1 p-1 group-hover:p-2 bg-base-100 rounded-box shadow-lg border-2 border-base-300">
            <span className="w-1 h-1 rounded-full transition-all flex group-hover:hidden bg-base-content" />
            <span className="w-1 h-3 rounded-full transition-all flex group-hover:hidden bg-base-300" />
            <button className="btn btn-square btn-sm transition-all hidden group-hover:flex">
              <Play className="w-4 h-4 fill-base-content" />
            </button>
            <div className="join join-vertical transition-all hidden group-hover:flex">
              <FacebookShare className="join-item" />
              <TwitterShare className="join-item" />
            </div>
          </div>
        </div>
        <div className="not-prose mb-16 flex flex-col gap-0">
          <div className="breadcrumbs text-sm">
            <ul>
              <AnimatePresence>
                {slugs.map(({ name, href }, i) => (
                  <motion.li
                    key={href}
                    initial={{ x: 16 * (i + 1), opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 16 * (i + 1), opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Link className="opacity-60 capitalize" href={href}>
                      {name.replace('-', ' ')}
                    </Link>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
          <div className="w-full flex flex-row gap-2 justify-end py-3 border-y border-base-300">
            <FacebookShare />
            <TwitterShare />
            <span className="grow" />
            <motion.button
              className="btn btn-sm rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Play className="w-4 h-4 fill-base-content" />
              Listen to Article
            </motion.button>
          </div>
        </div>
        <div className="not-prose w-full">
          <Tags value={tags} />
        </div>
        {children}
      </motion.article>
      <div className="w-full max-w-[65ch] grid grid-cols-12 gap-4">
        {[...routes].reverse().map((route, i) => (
          <motion.div
            key={route}
            className="col-span-full"
            initial={{ y: 8 * (i + 1), opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <BlogCard route={route} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
