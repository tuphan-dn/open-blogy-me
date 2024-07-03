import createMDX from '@next/mdx'

import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkToc from 'remark-toc'
import remarkSlug from 'remark-slug'
import rehypeKatex from 'rehype-katex'
import { rehypeExtendedHighlight } from '@gears-bot/rehype'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
}

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm, remarkMath, remarkToc, remarkSlug],
    rehypePlugins: [
      [rehypeExtendedHighlight, { tabsName: 'Tabs', tabName: 'Tab' }],
      rehypeKatex,
    ],
  },
})

export default withMDX(nextConfig)
