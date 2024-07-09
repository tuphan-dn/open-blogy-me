'use client'
import { useMemo, type ReactNode } from 'react'
import { useSelectedLayoutSegments } from 'next/navigation'
import useSWR from 'swr'
import axios from 'axios'
import dayjs from 'dayjs'

import Link from 'next/link'

export default function Template({ children }: { children: ReactNode }) {
  const segments = useSelectedLayoutSegments()
  const { data } = useSWR('/api/blog', async (api: string) => {
    const { data } = await axios.get<Tree>(api)
    return data
  })

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
      <div className="-m-6 w-[calc(100%+3rem)] px-6 py-2 bg-base-100 border-b-2 border-base-300 sticky top-0 z-10">
        <div className="breadcrumbs text-sm">
          <ul>
            {slugs.map(({ name, href }) => (
              <li key={href}>
                <Link className="opacity-60 capitalize" href={href}>
                  {name.replace('-', ' ')}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <article className="w-full my-32 prose prose-p:tracking-[-.25px]">
        {children}
      </article>
      <div className="w-full max-w-[65ch] grid grid-cols-12 gap-4">
        <div className="col-span-full divider divider-vertical m-0" />
        {(data?.children || []).map(
          ({ title, description, updatedAt, route }) => (
            <Link
              key={title}
              className="col-span-full flex flex-col gap-4 p-4 bg-base-200 border-2 border-base-300 rounded-3xl cursor-pointer"
              href={route}
            >
              <h1>{title}</h1>
              <p className="text-sm">{description}</p>
              <p className="text-xs opacity-60">
                {dayjs(updatedAt).format('DD MMMM, YYYY')}
              </p>
            </Link>
          ),
        )}
      </div>
    </div>
  )
}
