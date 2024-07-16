import { readFileSync } from 'fs'
import { scan, type Dree } from 'dree'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { select, selectAll } from 'unist-util-select'
import { toString } from 'mdast-util-to-string'
import { frontmatter } from 'micromark-extension-frontmatter'
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter'
import toml from 'toml'
import { z } from 'zod'
import { resolve } from 'path'
import { writeFileSync } from 'fs'

type ExtendedDree = Omit<Dree, 'children'> & {
  title: string
  tags: string[]
  description: string
  content: string
  children?: ExtendedDree[]
  date: Date
}

type Tree = {
  route: string
  children: Tree[]
  title: string
  tags: string[]
  description: string
  content: string
  date: Date
}

function dreelize(root: string): ExtendedDree | null {
  const dree = scan<ExtendedDree>(
    root,
    {
      size: false,
      sizeInBytes: false,
      hash: false,
      matches: '**/page.{md,mdx}',
      extensions: ['md', 'mdx'],
    },
    (node) => {
      const file = readFileSync(node.path)
      const md = fromMarkdown(file, {
        extensions: [frontmatter(['yaml', 'toml'])],
        mdastExtensions: [frontmatterFromMarkdown(['yaml', 'toml'])],
      })
      const matter = select('root > toml', md)
      const heading = select('root > heading', md) || {}
      const paragraph = select('root > paragraph', md) || {}
      const text = selectAll('heading, paragraph', md)
      const { tags, date } = z
        .object({
          tags: z
            .string()
            .default('')
            .transform((tags) =>
              tags
                .split(',')
                .map((e) => e.trim())
                .filter((e) => !!e),
            ),
          date: z.coerce.date().default(new Date()),
        })
        .parse(toml.parse(toString(matter)))
      node.title = toString(heading)
      node.tags = tags
      node.date = date
      node.description = toString(paragraph)
      node.content = text
        .map((e) => toString(e))
        .join(' ')
        .replaceAll('\n', ' ')
    },
  )
  return dree
}

function trielize(
  parentRoute: string,
  { name, children = [] }: ExtendedDree,
): Tree {
  const route = `${parentRoute}/${name}`
  const index = children.findIndex(({ type }) => type === 'file')
  const [
    only = {
      title: '',
      tags: [],
      description: '',
      value: '',
      content: '',
      date: new Date(),
    },
  ] = index >= 0 ? children.splice(index, 1) : []
  return {
    route,
    children: children
      .map((child) => trielize(route, child))
      .sort((a, b) => {
        if (a.date > b.date) return -1
        if (b.date > a.date) return 1
        if (a.title > b.title) return -1
        if (b.title > a.title) return 1
        return 0
      }),
    title: only.title,
    tags: only.tags,
    description: only.description,
    content: only.content || '',
    date: only.date,
  }
}

function flatten({ children = [], ...node }: Tree): Blog[] {
  return [
    { ...node, children: children.map(({ route }) => route) },
    ...children.map((child) => flatten(child)).flat(),
  ]
}

// Parse data
const root = resolve(process.cwd(), './src/app/blog')
const dree = dreelize(root)
if (!dree) throw new Error('Empty contents')
const tree = trielize('', dree)
// Write table
const table = flatten(tree)
writeFileSync('src/db/table.json', JSON.stringify(table, null, 2))
